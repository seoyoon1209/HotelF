# Hoteling Service Introduction

## Overview

Hoteling is a hotel booking cancellation prediction and decision-support service. It uses reservation information to estimate the probability that a booking will be canceled, helping hotel staff decide which reservations need attention first.

The service is intended for hotel operations, revenue management, and reservation teams. Its predictions support human judgment rather than replacing it: staff members remain responsible for customer contact, room resale preparation, and other follow-up actions.

## The Problem

Hotel cancellations create uncertainty in room inventory, customer service, resale planning, and expected revenue. When staff manage many reservations at once, it is difficult to review every booking with the same level of attention or to consistently recognize combinations of factors linked to cancellation.

Responding only after a cancellation is confirmed leaves less time to contact the customer or prepare the room for resale. Hoteling addresses this problem by organizing reservations according to predicted cancellation probability so that staff can begin reviewing relevant bookings earlier.

## How Hoteling Works

1. Reservation data is uploaded to the service.
2. The system checks the 15 required input features and validates their formats.
3. Valid records are preprocessed and sent to the cancellation prediction model.
4. The model returns a cancellation probability and predicted class for each booking.
5. Reservations are sorted by cancellation probability.
6. Staff review the reservation details and the 15 input values before deciding whether any follow-up is appropriate.
7. Prediction results, model versions, and staff actions can be stored for later review.

## Core Features

### Cancellation Prediction

Hoteling produces a cancellation probability and predicted class from 15 reservation features.

### Prioritized Reservation List

Bookings can be sorted by cancellation probability and filtered by fields such as arrival month, market segment, and customer type.

### Reservation Details

Staff can review the prediction together with the reservation information used by the model instead of relying on a score alone.

### Prediction History

The planned workflow stores the reservation identifier, prediction time, model version, prediction result, and staff action.

### CSV Export

Selected prediction results can be exported for operational review while minimizing directly identifying information.

## AI and Data

The project uses the City Hotel records from the public Hotel Booking Demand dataset. The data preparation process reduces 79,330 original records to 78,669 modeling records by removing invalid or implausible entries, including reservations with no adult guests, undefined distribution channels, unusually high average daily rates, and zero total nights.

The model input consists of 15 reservation features:

- Lead time
- Number of weekend nights
- Number of weekday nights
- Meal type
- Market segment
- Repeated guest status
- Number of previous canceled reservations
- Number of previous checked-in or non-canceled reservations
- Reserved room type
- Deposit type
- Customer type
- Average daily rate
- Number of guests
- Country code
- Arrival month

The modeling plan evaluates XGBoost, Random Forest, and Logistic Regression using five-fold time-series cross-validation to reduce time-based data leakage. F1 score is the primary evaluation metric, with ROC-AUC, cancellation-class recall, and accuracy used as supporting metrics. The performance values defined in the PRD are acceptance targets, not verified production results.

## Technical Architecture

- Frontend hosting: Render
- Backend: Python FastAPI hosted on Render
- Database: PostgreSQL hosted on Render
- Development tools: IntelliJ IDEA, PyCharm, and Claude Code
- External APIs: None currently confirmed

The web service components and database are hosted on Render. Integration of the trained prediction model with the service inference flow is planned and should not be described as complete until it is verified.

## User Value

Hoteling helps staff focus their limited review time on reservations with higher predicted cancellation probabilities. Earlier visibility can support more timely customer confirmation and room resale preparation while keeping final decisions under staff control.

## Current Scope and Limitations

The current scope covers City Hotel data preparation, a 15-feature model schema, model evaluation requirements, and a web service architecture. Automated cancellation, automatic pricing or refund changes, customer messaging, and PMS integration are outside the current scope.

The dataset covers reservations from July 2015 through August 2017 and comes from one public City Hotel dataset. Performance may differ for other hotels or more recent booking patterns. Operational improvements in staff time, cancellation rate, occupancy, or revenue have not yet been validated with real hotel users.
