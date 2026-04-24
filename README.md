# Computational-Thinking-Project

A simple machine-learning project built as part of a university module.

## Project Structure

```
├── data/
│   ├── raw/          # Original, unmodified data
│   └── processed/    # Cleaned and transformed data ready for modelling
│
├── notebooks/        # Jupyter notebooks for exploration and prototyping
│
├── src/
│   ├── data/         # Scripts to load and preprocess data
│   ├── features/     # Feature engineering and selection
│   ├── models/       # Model definitions, training and evaluation
│   └── utils/        # Shared helper functions
│
├── tests/            # Unit tests
│
├── models/           # Serialised/saved model artefacts
│
├── reports/
│   └── figures/      # Generated charts and evaluation plots
│
├── requirements.txt  # Python dependencies
└── README.md
```

## Getting Started

1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Launch Jupyter to explore the notebooks:
   ```bash
   jupyter notebook notebooks/
   ```