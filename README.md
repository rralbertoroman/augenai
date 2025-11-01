# AugenAI

## Prerequisites

1. Install Python 3.12.3

2. Install Poetry

## Installation

1. Install the AI service by creating and installing the Poetry virtual environment and its dependencies. Configure Poetry to install the virtual environment locally by running:

   ```bash
   poetry config virtualenvs.in-project true
   ```

2. Install the dependencies and activate the virtual environment by running:

   ```bash
   cd apps/ai-service
   poetry install
   ```

3. Go to the project root directory and install the rest of the dependencies by running:

   ```bash
   cd ../..
   pnpm install
   ```

At this point, you should have the project installed and ready to run.

## Running the development version

Run the development version of the system by running:

```bash
source apps/ai-service/.venv/bin/activate
pnpm run dev
```
