.PHONY: test showExamples

default: test

install: requirements.txt
	python -m pip install -r requirements.txt

test:
	python -m unittest test/test_diag.py

showExamples:
	$(PYTHON) blockdiag/examples.py
