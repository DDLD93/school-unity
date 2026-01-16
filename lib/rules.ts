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
  TeacherSummary,
  Equipment,
  ComputerLab,
  Facility,
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
  const teacherStatus = calculateTeacherStatus(school.teacherSummary, school.totalStudents);
  const equipmentStatus = calculateEquipmentStatus(school.equipment);
  const computerLabStatus = calculateComputerLabStatus(school.computerLabs);
  const facilityStatus = calculateFacilityStatus(school.facilities);

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
    teacherStatus,
    equipmentStatus,
    computerLabStatus,
    facilityStatus,
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

  // Teacher/Services risks
  const teacherStatus = calculateTeacherStatus(school.teacherSummary, school.totalStudents);
  if (teacherStatus !== Status.Green) {
    const ratio = school.totalStudents / school.teacherSummary.total;
    const qualPercent = (school.teacherSummary.qualified / school.teacherSummary.total) * 100;
    flags.push({
      category: RiskCategory.Services,
      severity: teacherStatus,
      description: teacherStatus === Status.Red
        ? `Critical teacher shortage: ${ratio.toFixed(1)}:1 ratio or ${qualPercent.toFixed(0)}% qualified`
        : `Teacher shortage: ${ratio.toFixed(1)}:1 ratio or ${qualPercent.toFixed(0)}% qualified`,
      active: true,
    });
  }

  // Equipment risks
  const equipmentStatus = calculateEquipmentStatus(school.equipment);
  if (equipmentStatus !== Status.Green) {
    const totalItems = school.equipment.reduce((sum, eq) => sum + eq.totalCount, 0);
    const functionalItems = school.equipment.reduce((sum, eq) => sum + eq.functionalCount, 0);
    const functionalPercentage = totalItems > 0 ? (functionalItems / totalItems) * 100 : 0;
    flags.push({
      category: RiskCategory.Services,
      severity: equipmentStatus,
      description: equipmentStatus === Status.Red
        ? `Critical equipment failure: ${functionalPercentage.toFixed(0)}% functional`
        : `Equipment issues: ${functionalPercentage.toFixed(0)}% functional`,
      active: true,
    });
  }

  // Computer lab risks
  const computerLabStatus = calculateComputerLabStatus(school.computerLabs);
  if (computerLabStatus !== Status.Green) {
    const totalComputers = school.computerLabs.reduce((sum, lab) => sum + lab.totalComputers, 0);
    const functionalComputers = school.computerLabs.reduce((sum, lab) => sum + lab.functionalComputers, 0);
    const functionalPercentage = totalComputers > 0 ? (functionalComputers / totalComputers) * 100 : 0;
    flags.push({
      category: RiskCategory.Services,
      severity: computerLabStatus,
      description: computerLabStatus === Status.Red
        ? `Critical computer lab issues: ${functionalPercentage.toFixed(0)}% functional`
        : `Computer lab issues: ${functionalPercentage.toFixed(0)}% functional`,
      active: true,
    });
  }

  // Facilities risks
  const facilityStatus = calculateFacilityStatus(school.facilities);
  if (facilityStatus !== Status.Green) {
    const closedCount = school.facilities.filter(f => f.operationalStatus === OperationalStatus.Closed).length;
    const poorCount = school.facilities.filter(f => f.condition === Condition.Poor).length;
    flags.push({
      category: RiskCategory.Facilities,
      severity: facilityStatus,
      description: facilityStatus === Status.Red
        ? `Critical facility issues: ${closedCount} closed, ${poorCount} in poor condition`
        : `Facility concerns: ${closedCount} closed, ${poorCount} in poor condition`,
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

export function calculateTeacherStatus(teacherSummary: TeacherSummary, totalStudents: number): Status {
  // Calculate teacher-student ratio (ideal: 1:25 or better)
  const ratio = totalStudents / teacherSummary.total;
  const qualificationPercentage = (teacherSummary.qualified / teacherSummary.total) * 100;

  // Red: Ratio > 35 OR qualification < 60%
  if (ratio > 35 || qualificationPercentage < 60) {
    return Status.Red;
  }

  // Amber: Ratio > 30 OR qualification < 75%
  if (ratio > 30 || qualificationPercentage < 75) {
    return Status.Amber;
  }

  return Status.Green;
}

export function calculateEquipmentStatus(equipment: Equipment[]): Status {
  if (equipment.length === 0) {
    return Status.Red;
  }

  // Calculate overall functional percentage
  const totalItems = equipment.reduce((sum, eq) => sum + eq.totalCount, 0);
  const functionalItems = equipment.reduce((sum, eq) => sum + eq.functionalCount, 0);
  const functionalPercentage = totalItems > 0 ? (functionalItems / totalItems) * 100 : 0;

  // Check for poor condition equipment
  const poorConditionCount = equipment.filter(eq => eq.condition === Condition.Poor).length;
  const poorConditionPercentage = (poorConditionCount / equipment.length) * 100;

  // Red: <60% functional OR >50% in poor condition
  if (functionalPercentage < 60 || poorConditionPercentage > 50) {
    return Status.Red;
  }

  // Amber: <80% functional OR >30% in poor condition
  if (functionalPercentage < 80 || poorConditionPercentage > 30) {
    return Status.Amber;
  }

  return Status.Green;
}

export function calculateComputerLabStatus(computerLabs: ComputerLab[]): Status {
  if (computerLabs.length === 0) {
    return Status.Red;
  }

  // Calculate overall functional percentage
  const totalComputers = computerLabs.reduce((sum, lab) => sum + lab.totalComputers, 0);
  const functionalComputers = computerLabs.reduce((sum, lab) => sum + lab.functionalComputers, 0);
  const functionalPercentage = totalComputers > 0 ? (functionalComputers / totalComputers) * 100 : 0;

  // Check for poor condition or closed labs
  const hasPoorCondition = computerLabs.some(lab => lab.condition === Condition.Poor);
  const hasClosed = computerLabs.some(lab => lab.operationalStatus === OperationalStatus.Closed);

  // Red: <50% functional OR poor condition OR closed
  if (functionalPercentage < 50 || hasPoorCondition || hasClosed) {
    return Status.Red;
  }

  // Amber: <75% functional OR partial status
  if (functionalPercentage < 75 || computerLabs.some(lab => lab.operationalStatus === OperationalStatus.Partial)) {
    return Status.Amber;
  }

  return Status.Green;
}

export function calculateFacilityStatus(facilities: Facility[]): Status {
  if (facilities.length === 0) {
    return Status.Amber; // No facilities is a concern but not critical
  }

  // Check for closed facilities
  const closedFacilities = facilities.filter(f => f.operationalStatus === OperationalStatus.Closed);
  const closedPercentage = (closedFacilities.length / facilities.length) * 100;

  // Check for poor condition facilities
  const poorConditionFacilities = facilities.filter(f => f.condition === Condition.Poor);
  const poorConditionPercentage = (poorConditionFacilities.length / facilities.length) * 100;

  // Red: >40% closed OR >50% in poor condition
  if (closedPercentage > 40 || poorConditionPercentage > 50) {
    return Status.Red;
  }

  // Amber: >20% closed OR >30% in poor condition OR any partial status
  if (
    closedPercentage > 20 ||
    poorConditionPercentage > 30 ||
    facilities.some(f => f.operationalStatus === OperationalStatus.Partial)
  ) {
    return Status.Amber;
  }

  return Status.Green;
}
