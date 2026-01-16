import {
  School,
  Status,
  Hostel,
  Classroom,
  WaterSource,
  PowerSource,
  RiskCategory,
  RiskFlag,
  NationalAggregates,
  Condition,
  OperationalStatus,
  WaterReliability,
} from "./types";

export function calculateHostelStatus(hostel: Hostel): Status {
  const utilizationRatio = hostel.totalBeds > 0 
    ? (hostel.currentOccupancy / hostel.totalBeds) * 100 
    : 0;

  // Red conditions: Poor condition OR >120% occupancy OR Closed
  if (
    hostel.condition === Condition.Poor ||
    utilizationRatio > 120 ||
    hostel.operationalStatus === OperationalStatus.Closed
  ) {
    return Status.Red;
  }

  // Amber conditions: Fair condition OR >100% occupancy OR Partial status
  if (
    hostel.condition === Condition.Fair ||
    utilizationRatio > 100 ||
    hostel.operationalStatus === OperationalStatus.Partial
  ) {
    return Status.Amber;
  }

  return Status.Green;
}

export function calculateClassroomStatus(classroom: Classroom): Status {
  const loadRatio = classroom.seatingCapacity > 0
    ? (classroom.currentStudents / classroom.seatingCapacity) * 100
    : 0;

  // Red: Severe overcrowding (>120%) OR Poor condition
  if (loadRatio > 120 || classroom.condition === Condition.Poor) {
    return Status.Red;
  }

  // Amber: Overcrowding (>100%) OR Fair condition OR inadequate ventilation
  if (
    loadRatio > 100 ||
    classroom.condition === Condition.Fair ||
    !classroom.ventilationAdequacy
  ) {
    return Status.Amber;
  }

  return Status.Green;
}

export function calculateWaterStatus(waterSources: WaterSource[]): Status {
  if (waterSources.length === 0) {
    return Status.Red;
  }

  const functionalSources = waterSources.filter(ws => ws.functionalStatus);
  
  if (functionalSources.length === 0) {
    return Status.Red;
  }

  // Check if any source has constant reliability
  const hasConstant = functionalSources.some(
    ws => ws.reliability === WaterReliability.Constant
  );

  if (!hasConstant) {
    // Check if any has intermittent
    const hasIntermittent = functionalSources.some(
      ws => ws.reliability === WaterReliability.Intermittent
    );
    
    if (hasIntermittent) {
      return Status.Amber;
    }
    
    return Status.Red;
  }

  return Status.Green;
}

export function calculatePowerStatus(powerSources: PowerSource[]): Status {
  if (powerSources.length === 0) {
    return Status.Red;
  }

  const operationalSources = powerSources.filter(ps => ps.operationalStatus);
  
  if (operationalSources.length === 0) {
    return Status.Red;
  }

  // Find the best power source (highest hours/day)
  const bestSource = operationalSources.reduce((best, current) =>
    current.averageHoursPerDay > best.averageHoursPerDay ? current : best
  );

  // Red: <6 hours/day without backup
  if (bestSource.averageHoursPerDay < 6 && !bestSource.backupAvailable) {
    return Status.Red;
  }

  // Amber: <12 hours/day OR no backup available
  if (bestSource.averageHoursPerDay < 12 || !bestSource.backupAvailable) {
    return Status.Amber;
  }

  return Status.Green;
}

export function calculateSchoolStatus(school: School): Status {
  // Calculate status for each domain
  const hostelStatuses = school.hostels.map(calculateHostelStatus);
  const classroomStatuses = school.classrooms.map(calculateClassroomStatus);
  const waterStatus = calculateWaterStatus(school.waterSources);
  const powerStatus = calculatePowerStatus(school.powerSources);

  // Check for overcrowding risk
  const totalBeds = school.hostels.reduce((sum, h) => sum + h.totalBeds, 0);
  const totalOccupancy = school.hostels.reduce((sum, h) => sum + h.currentOccupancy, 0);
  const overallUtilization = totalBeds > 0 ? (totalOccupancy / totalBeds) * 100 : 0;
  
  let overcrowdingStatus: Status = Status.Green;
  if (overallUtilization > 120) {
    overcrowdingStatus = Status.Red;
  } else if (overallUtilization > 100) {
    overcrowdingStatus = Status.Amber;
  }

  // Collect all statuses
  const allStatuses = [
    ...hostelStatuses,
    ...classroomStatuses,
    waterStatus,
    powerStatus,
    overcrowdingStatus,
  ];

  // Return worst status (Red > Amber > Green)
  if (allStatuses.includes(Status.Red)) {
    return Status.Red;
  }
  if (allStatuses.includes(Status.Amber)) {
    return Status.Amber;
  }
  return Status.Green;
}

export function generateRiskFlags(school: School): RiskFlag[] {
  const flags: RiskFlag[] = [];
  const schoolStatus = calculateSchoolStatus(school);

  // Hostel risks
  const hostelStatuses = school.hostels.map(calculateHostelStatus);
  const worstHostelStatus = hostelStatuses.includes(Status.Red)
    ? Status.Red
    : hostelStatuses.includes(Status.Amber)
    ? Status.Amber
    : Status.Green;

  if (worstHostelStatus !== Status.Green) {
    flags.push({
      category: RiskCategory.Infrastructure,
      severity: worstHostelStatus,
      description: `Hostel infrastructure issues: ${worstHostelStatus === Status.Red ? "Critical" : "Moderate"} condition or capacity problems`,
      active: true,
    });
  }

  // Classroom risks
  const classroomStatuses = school.classrooms.map(calculateClassroomStatus);
  const worstClassroomStatus = classroomStatuses.includes(Status.Red)
    ? Status.Red
    : classroomStatuses.includes(Status.Amber)
    ? Status.Amber
    : Status.Green;

  if (worstClassroomStatus !== Status.Green) {
    flags.push({
      category: RiskCategory.Infrastructure,
      severity: worstClassroomStatus,
      description: `Classroom issues: ${worstClassroomStatus === Status.Red ? "Severe overcrowding" : "Overcrowding or condition concerns"}`,
      active: true,
    });
  }

  // Water risks
  const waterStatus = calculateWaterStatus(school.waterSources);
  if (waterStatus !== Status.Green) {
    flags.push({
      category: RiskCategory.Water,
      severity: waterStatus,
      description: waterStatus === Status.Red
        ? "No reliable water source functional"
        : "Intermittent water supply",
      active: true,
    });
  }

  // Power risks
  const powerStatus = calculatePowerStatus(school.powerSources);
  if (powerStatus !== Status.Green) {
    flags.push({
      category: RiskCategory.Power,
      severity: powerStatus,
      description: powerStatus === Status.Red
        ? "Insufficient power availability (<6hrs/day without backup)"
        : "Limited power availability or no backup",
      active: true,
    });
  }

  // Overcrowding risks
  const totalBeds = school.hostels.reduce((sum, h) => sum + h.totalBeds, 0);
  const totalOccupancy = school.hostels.reduce((sum, h) => sum + h.currentOccupancy, 0);
  const overallUtilization = totalBeds > 0 ? (totalOccupancy / totalBeds) * 100 : 0;

  if (overallUtilization > 120) {
    flags.push({
      category: RiskCategory.Overcrowding,
      severity: Status.Red,
      description: `Severe overcrowding: ${overallUtilization.toFixed(0)}% capacity utilization`,
      active: true,
    });
  } else if (overallUtilization > 100) {
    flags.push({
      category: RiskCategory.Overcrowding,
      severity: Status.Amber,
      description: `Overcrowding: ${overallUtilization.toFixed(0)}% capacity utilization`,
      active: true,
    });
  }

  return flags;
}

export function calculateNationalAggregates(schools: School[]): NationalAggregates {
  const totalStudents = schools.reduce((sum, school) => sum + school.totalStudents, 0);
  
  const schoolsByStatus = {
    green: 0,
    amber: 0,
    red: 0,
  };

  schools.forEach(school => {
    const status = calculateSchoolStatus(school);
    switch (status) {
      case Status.Green:
        schoolsByStatus.green++;
        break;
      case Status.Amber:
        schoolsByStatus.amber++;
        break;
      case Status.Red:
        schoolsByStatus.red++;
        break;
    }
  });

  return {
    totalSchools: schools.length,
    totalStudents,
    schoolsByStatus,
  };
}

export function getTotalBoardingCapacity(school: School): number {
  return school.hostels.reduce((sum, hostel) => sum + hostel.totalBeds, 0);
}
