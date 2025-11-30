# Patient Safety Management System (PSMS)

## About PSMS

Welcome to the **Patient Safety Management System (PSMS)**, a cloud-hosted web application developed as part of two university projects at Torrens University Australia:

- **Phase 1:** ITW601 (N03812) – Info Tech Work Integrated Learning  
- **Phase 2:** ITA602 – Advanced Information Technology


## Project Overview

PSMS is a web-based system designed to improve patient safety through streamlined data management and intelligent monitoring.

The application provides:

- A browser-based dashboard for viewing patient vital signs and risk.
- A secure API and database for managing patients and users.
- An AI-driven risk score that reacts to changing vital signs (Phase 2).
- A cloud deployment so the system can be accessed on a real domain.

## What Problem Are We Solving?

In many healthcare settings, clinicians face three recurring issues:

1. **Fragmented data** – vital signs and key information are scattered across multiple systems.  
2. **Delayed insight** – risk is often noticed only after a patient deteriorates.  
3. **Manual, time-consuming workflows** – staff spend time chasing data instead of making decisions.

PSMS aims to:

- Provide **timely, consolidated views** of patient status.
- Offer an **AI-based risk score** to highlight patients who may need attention.
- Demonstrate how **cloud and data management** can be combined to support safer, more proactive care.


## Key Features

### Core Functionality (Phase 1 – ITW601)

- **Real-time data ingestion and visualisation**  
  Display patient vital signs and basic status in a web dashboard.

- **Web-based management**  
  Basic CRUD operations for patient records and related data.

- **Cloud deployment**  
  Initial deployment of the application to AWS as a proof of concept.

### Security, AI and Deployment (Phase 2 – ITA602)

- **Authentication and Authorisation**
  - Login via **AWS Cognito** (OAuth 2.0 / OIDC).
  - **Role-based access** (e.g. Admin vs Doctor) enforced in the API and UI.

- **AI-Driven Risk Assessment**
  - Integration of a **machine-learning model** to estimate patient risk from vital signs.
  - **Demo mode** with scripted patient scenarios (stable, deteriorating, recovering, critical) to show the AI behaviour safely.

- **Cloud Infrastructure & Hardening**
  - Deployed on **AWS EC2** with **Nginx** reverse proxy and **HTTPS**.
  - Backend and frontend split across separate services and domains.
  - Use of environment variables for secrets and configuration.

## Technologies Used

**Backend**

- Node.js  
- Express.js  
- MongoDB (MongoDB Atlas)

**Frontend**

- React.js  
- Chakra UI (component library)

**Infrastructure & DevOps**

- AWS EC2  
- Nginx  
- PM2 (Node process manager)  
- AWS Cognito (authentication and identity)  
- Let’s Encrypt (TLS certificates)

**AI / Data**

- Python & scikit-learn (Random Forest model)  
- Synthetic / simulated patient data for demonstration


## Project Phases & Team

### Phase 1 – ITW601 (N03812) Info Tech Work Integrated Learning

Initial design and build of the PSMS web application:

- **Core focus:**
  - Baseline web app (frontend + backend)
  - Patient data management and visualisation
  - Initial cloud deployment to AWS

- **Team:**
  - **Igor Vojinovic (A00137965)**  
    Backend development and support with testing.
  - **Jonathan Josipp Guachamin Jimenez (A00109506)**  
    Frontend development and UI design.
  - **Mehmet Emin Seyhan (A00111734)**  
    Project management and deployment to AWS.

### Phase 2 – ITA602 Advanced Information Technology

Security, AI integration and production-style deployment:

- **Core focus:**
  - Authentication (Cognito) and role-based access control
  - AI risk scoring model and demo mode
  - Refined AWS deployment (separate API, HTTPS, configuration)
  - Hardening and documentation

- **Team:**
  - **Igor Vojinovic (A00137965)**  
    Backend & security, AI integration, cloud deployment.
  - **Anthony Ajero (A00117248)**  
    Frontend flows, role-based UI, testing and documentation support.


## High-Level Architecture

- Users access the **React frontend** in a browser.
- The frontend communicates with a **Node/Express API**, secured by JWT tokens issued by AWS Cognito.
- The API reads/writes data from **MongoDB Atlas**.
- The AI risk model is exposed via a Python service and called from the backend when risk scores are needed.
- Everything is hosted on **AWS**, fronted by **Nginx** with **HTTPS** termination.


