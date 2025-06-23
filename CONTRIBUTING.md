
# Contributing to Red_Teaming_Bot

Thank you for your interest in contributing to Red_Teaming_Bot.  
This is a full-stack project with a React frontend and a Python backend managed using Poetry. We welcome contributions in code, documentation, design, or testing.

---

## Project Structure

```

/frontend     → React-based user interface for chatbot widgets
/backend      → Python API backend using Poetry
/docs         → Project documentation
````

---

## Getting Started

### 1. Fork and Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Red_Teaming_Bot.git
cd Red_Teaming_Bot
````

### 2. Set Up the Backend

Install [Poetry](https://python-poetry.org/docs/#installation) if not already installed.

```bash
cd backend
poetry install
poetry run task cli
```

To run the development server:

```bash
poetry run task api
```
---

### 3. Set Up the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000` by default.

---

## Contribution Workflow

### 1. Open or Choose an Issue

* Browse open issues or propose a new one.
* Comment on the issue to express interest before starting.

### 2. Create a Feature Branch

```bash
git checkout -b feature/short-description
```

### 3. Make Changes

* Keep code modular, consistent, and well-documented.
* Include meaningful commit messages.

### 4. Run Tests

Backend tests:

```bash
cd backend
poetry run pytest
```

Frontend tests:

```bash
cd frontend
npm test
```

### 5. Format Code

Backend:

```bash
poetry run black .
poetry run isort .
poetry run flake8
```

Frontend:

```bash
npm run lint
npm run format
```

---

## Pull Request Checklist

Before submitting a pull request:

* [ ] My code follows the style guidelines of this project
* [ ] I have tested my changes
* [ ] I have added or updated documentation where necessary
* [ ] I have linked related issues in the pull request description
* [ ] I have squashed related commits into one logical commit

Submit your pull request to the `main` branch and complete the pull request template.

---

## Testing Notes

* Use `pytest` for unit/integration tests in the backend
* Use React Testing Library for UI component logic
* Cypress may be used for end-to-end testing (optional)

---

## Documentation

If your change affects usage, configuration, or user experience:

* Update or add relevant documentation under `/docs`
* Include inline docstrings and comments where appropriate

---

## Questions or Help

If you are unsure how to proceed or want to discuss a larger feature/change, feel free to:

* Open an issue
* Start a draft pull request
* Create a discussion thread (if enabled)

We appreciate your contributions and look forward to collaborating with you.
