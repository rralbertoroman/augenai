MODEL_TASKS = {
    "classification": ["single_label_classification"],
    "detection": [],
    "segmentation": [],
}


def get_model_task(problem: str) -> str:
    if not problem:
        raise ValueError("Problem cannot be empty")

    problem = problem.strip()
    try:
        return next(
            key for key, values in MODEL_TASKS.items() if values and problem in values
        )
    except StopIteration:
        raise ValueError("Invalid problem type")
