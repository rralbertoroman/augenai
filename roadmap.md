# Future Tasks

## Deployment

- [ ] **Docker Optimization**: Further reduce image sizes by using CPU-specific PyTorch builds if GPU is not required, or using multi-stage builds more aggressively.

## Dashboard

- [ ] **Improve patient and disease statistics**: Add filters to improve efficiency in the exploration range, given that it currently shows all the predictions and in the future this could significantly increase loading times.
- [ ] **Lesion analytics**: Provide insights into the rate of appearance of lesions and their location on the retina to help spot patterns.
- [ ] **Clinical background analysis**: Leverage LLMs to provide insights into the clinical background of the patient.
- [ ] **Improve filtering in model stats pane**: Allow the user to filter the predictions by patient age, gender, and clinical info to spot particular prediction errors of the model.

## Prediction (list) page

- [ ] **Create modal for detection feedback**: In an interactive modal allow the user to add, move, relabel, resize and eliminate bounding boxes to correct the predictions.
- [ ] **Add filters and sorting**: Allow the user to filter the predictions by patient age, gender, task, and clinical info.
- [ ] **Add pagination**: Allow the user to navigate through the predictions.

## Post-processing

- [ ] **Implement dataset generation module**: This module will be used to generate new datasets, facilitating the training of additional models.
- [ ] **Integrate new models**: Add additional models to expand the coverage of detected diseases.

## Unit Tests

- [ ] **Implement unit tests**: Add unit tests to ensure the functionality of the Back-end.
