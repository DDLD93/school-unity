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
