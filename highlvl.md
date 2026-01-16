Below is a **clean, consolidated high-level system design** for the **Unity Schools Executive Dashboard (Pilot)**, explicitly incorporating **granular infrastructure data** (hostels, hostel types, blocks, construction types, utilities, etc.) and remaining **fully programming-language and framework agnostic**.

This version is suitable for **government briefing, archival, or delegation to any technical team**.

---

# UNITY SCHOOLS EXECUTIVE DASHBOARD

**High-Level System Design (Pilot – Sample Data)**

---

## 1. Purpose & Intent

### Objective

Provide a **Minister-level situational overview** of Federal Unity Schools that enables leadership to:

* See national status instantly
* Identify problem schools quickly
* Understand *why* a school is flagged, without operational detail

This is a **demo system**, not production.

**Design intent:**

> “I can see what is happening. I am in control.”

---

## 2. Design Principles

* Executive-first, not operator-first
* Read-only, briefing-grade interface
* Deterministic indicators (no ambiguity)
* Traffic-light visual language
* Drill-down credibility from granular data
* Simplicity over completeness

---

## 3. High-Level Logical Architecture

```
┌────────────────────────────┐
│   Data Authoring Layer     │
│ (Sample / Simulated Data)  │
└──────────────┬─────────────┘
               │
┌────────────────────────────┐
│ Granular Data Store        │
│ (Schools & Infrastructure)│
└──────────────┬─────────────┘
               │
┌────────────────────────────┐
│ Rules & Scoring Engine     │
│ (Threshold-Based Logic)    │
└──────────────┬─────────────┘
               │
┌────────────────────────────┐
│ Indicator Aggregation      │
│ (School & National Level)  │
└──────────────┬─────────────┘
               │
┌────────────────────────────┐
│ Executive Dashboard Views  │
│ (4 Read-Only Screens)      │
└────────────────────────────┘
```

---

## 4. Data Layer (Granular, Neutral, Inspectable)

### 4.1 Core Entities

#### School

* School ID
* Name
* State
* Total students
* Total staff
* Notes (short executive summary)

---

### 4.2 Boarding Infrastructure

#### Hostel (Physical Unit)

* Hostel ID
* School ID
* Hostel name
* Hostel type (Male / Female / Mixed)
* Construction type (Concrete / Block / Prefab)
* Year built
* Condition (Good / Fair / Poor)
* Operational status (Functional / Partial / Closed)
* Total rooms
* Total beds
* Current occupancy

#### Hostel Block

* Block ID
* Hostel ID
* Block name
* Number of floors
* Rooms per floor
* Block condition
* Fire/safety indicator

---

### 4.3 Classroom Infrastructure

#### Classroom

* Classroom ID
* School ID
* Academic block name
* Seating capacity
* Current students
* Construction type
* Ventilation adequacy
* Condition status

---

### 4.4 Water Infrastructure

#### Water Source

* Water source ID
* School ID
* Source type (Borehole / Pipe / Well)
* Capacity (litres/day)
* Functional status
* Reliability (Constant / Intermittent / None)
* Last maintenance date

---

### 4.5 Power Infrastructure

#### Power Source

* Power source ID
* School ID
* Source type (Grid / Generator / Solar)
* Capacity (kW)
* Average hours/day
* Operational status
* Backup availability

---

### 4.6 Construction Metadata (Reusable)

* Construction type
* Roof type
* Structural rating (Sound / Aging / Unsafe)

---

## 5. Normalization & Rules Engine

### Purpose

Convert raw, granular data into **executive indicators** using **fixed rules**.

No AI. No prediction. No learning.

---

### 5.1 Derived Metrics

* Hostel utilization ratio = Occupancy ÷ Total beds
* Classroom load = Students ÷ Seating capacity
* Water availability level
* Power availability hours/day

---

### 5.2 Infrastructure Status Rules

Each domain produces **Green / Amber / Red**:

| Domain     | Red Example                       |
| ---------- | --------------------------------- |
| Hostels    | Poor condition OR >120% occupancy |
| Classrooms | Severe overcrowding               |
| Water      | No reliable source                |
| Power      | <6 hrs/day without backup         |

---

### 5.3 School Overall Status

```
School Status = Worst Status among:
- Hostels
- Classrooms
- Water
- Power
- Overcrowding
```

This ensures **no critical issue is hidden**.

---

## 6. Risk & Alert Model

### Risk Flags (Derived)

* Hostel risk
* Water risk
* Power risk
* Overcrowding risk

Each risk has:

* Category
* Severity (Amber / Red)
* Short description
* Active flag

Used for grouping and early warning.

---

## 7. Dashboard View Design

---

### 7.1 Screen 1 — Executive Overview

**Purpose:** National snapshot

**Displays:**

* Total Unity Schools
* Total students
* Schools OK (Green)
* Schools needing attention (Amber)
* Schools urgent (Red)

**Design:**

* Large numbers
* Traffic-light colours
* Minimal text
* Presidential briefing tone

---

### 7.2 Screen 2 — School List View

**Purpose:** Drill-down control

**Columns:**

* School name
* State
* Student population
* Boarding capacity
* Overall infrastructure status
* Active risk flags

**Behavior:**

* Severity-based sorting
* Click → School Detail

---

### 7.3 Screen 3 — School Detail Page

**Purpose:** Executive briefing on one school

**Shows:**

* School name & state
* Students
* Staff
* Boarding capacity

**Infrastructure panel:**

* Hostels (G/A/R)
* Classrooms (G/A/R)
* Water (G/A/R)
* Power (G/A/R)

**Notes:**

* One short, plain-language paragraph

---

### 7.4 Screen 4 — Risk & Alerts View

**Purpose:** Early warning & prioritization

**Grouped by:**

* Infrastructure
* Water
* Power
* Overcrowding

**Shows:**

* Only Red-flag schools
* School name + state

---

## 8. Data Flow Summary

```
Granular Infrastructure Data
        ↓
Derived Metrics
        ↓
Infrastructure Status
        ↓
School Status
        ↓
National Aggregates
        ↓
Dashboard Screens
```

---

## 9. Non-Functional Characteristics (Pilot)

* Read-only
* No authentication required
* Static or semi-static data
* Fast loading
* Screenshot / presentation friendly

---

## 10. Explicit Non-Goals

* No real-time feeds
* No field data collection
* No workflows
* No budget tracking
* No predictive analytics

---

## 11. Positioning Statement

This system is:

* Politically safe
* Technically explainable
* Visually authoritative
* Structurally extensible

It demonstrates **oversight, control, and clarity**, not operational depth.
