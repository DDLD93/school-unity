export enum Status {
  Green = "green",
  Amber = "amber",
  Red = "red",
}

export enum HostelType {
  Male = "male",
  Female = "female",
  Mixed = "mixed",
}

export enum ConstructionType {
  Concrete = "concrete",
  Block = "block",
  Prefab = "prefab",
}

export enum Condition {
  Good = "good",
  Fair = "fair",
  Poor = "poor",
}

export enum OperationalStatus {
  Functional = "functional",
  Partial = "partial",
  Closed = "closed",
}

export enum WaterSourceType {
  Borehole = "borehole",
  Pipe = "pipe",
  Well = "well",
}

export enum WaterReliability {
  Constant = "constant",
  Intermittent = "intermittent",
  None = "none",
}

export enum PowerSourceType {
  Grid = "grid",
  Generator = "generator",
  Solar = "solar",
}

export enum RiskCategory {
  Infrastructure = "infrastructure",
  Water = "water",
  Power = "power",
  Overcrowding = "overcrowding",
  Services = "services",
  Facilities = "facilities",
}

export enum EquipmentCategory {
  Computers = "computers",
  LabEquipment = "lab_equipment",
  SportsEquipment = "sports_equipment",
  Furniture = "furniture",
  LibraryBooks = "library_books",
  AudioVisual = "audio_visual",
  Other = "other",
}

export enum FacilityType {
  ScienceLab = "science_lab",
  ComputerLab = "computer_lab",
  Library = "library",
  SportsCenter = "sports_center",
  StaffQuarters = "staff_quarters",
  Auditorium = "auditorium",
  Cafeteria = "cafeteria",
  Clinic = "clinic",
  Workshop = "workshop",
}

export enum TeacherQualification {
  BEd = "b_ed",
  MEd = "m_ed",
  PhD = "phd",
  Other = "other",
}

export enum SubjectArea {
  Science = "science",
  Arts = "arts",
  Commercial = "commercial",
  Technical = "technical",
  Languages = "languages",
  Mathematics = "mathematics",
  SocialStudies = "social_studies",
  PhysicalEducation = "physical_education",
}

export interface HostelBlock {
  id: string;
  hostelId: string;
  name: string;
  floors: number;
  roomsPerFloor: number;
  condition: Condition;
  fireSafety: boolean;
}

export interface Hostel {
  id: string;
  schoolId: string;
  name: string;
  type: HostelType;
  constructionType: ConstructionType;
  yearBuilt: number;
  condition: Condition;
  operationalStatus: OperationalStatus;
  totalRooms: number;
  totalBeds: number;
  currentOccupancy: number;
  blocks?: HostelBlock[];
}

export interface Classroom {
  id: string;
  schoolId: string;
  academicBlockName: string;
  seatingCapacity: number;
  currentStudents: number;
  constructionType: ConstructionType;
  ventilationAdequacy: boolean;
  condition: Condition;
}

export interface WaterSource {
  id: string;
  schoolId: string;
  sourceType: WaterSourceType;
  capacity: number; // litres/day
  functionalStatus: boolean;
  reliability: WaterReliability;
  lastMaintenanceDate?: string;
}

export interface PowerSource {
  id: string;
  schoolId: string;
  sourceType: PowerSourceType;
  capacity: number; // kW
  averageHoursPerDay: number;
  operationalStatus: boolean;
  backupAvailable: boolean;
}

export interface RiskFlag {
  category: RiskCategory;
  severity: Status;
  description: string;
  active: boolean;
}

export interface TeacherSummary {
  total: number;
  qualified: number;
  byQualification: {
    bEd: number;
    mEd: number;
    phd: number;
    other: number;
  };
  bySubjectArea: {
    science: number;
    arts: number;
    commercial: number;
    technical: number;
    languages: number;
    mathematics: number;
    socialStudies: number;
    physicalEducation: number;
  };
}

export interface Equipment {
  id: string;
  schoolId: string;
  category: EquipmentCategory;
  totalCount: number;
  functionalCount: number;
  condition: Condition;
}

export interface ComputerLab {
  id: string;
  schoolId: string;
  name: string;
  totalComputers: number;
  functionalComputers: number;
  lastMaintenanceDate?: string;
  condition: Condition;
  operationalStatus: OperationalStatus;
}

export interface Facility {
  id: string;
  schoolId: string;
  type: FacilityType;
  name: string;
  capacity: number;
  currentUsage: number;
  condition: Condition;
  operationalStatus: OperationalStatus;
  equipmentCount?: number;
}

export interface School {
  id: string;
  name: string;
  state: string;
  totalStudents: number;
  totalStaff: number;
  notes: string;
  hostels: Hostel[];
  classrooms: Classroom[];
  waterSources: WaterSource[];
  powerSources: PowerSource[];
  teacherSummary: TeacherSummary;
  equipment: Equipment[];
  computerLabs: ComputerLab[];
  facilities: Facility[];
  riskFlags?: RiskFlag[];
}

export interface NationalAggregates {
  totalSchools: number;
  totalStudents: number;
  schoolsByStatus: {
    green: number;
    amber: number;
    red: number;
  };
}
