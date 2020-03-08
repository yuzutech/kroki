default:

package:
	docker build -t yuzutech/kroki-blockdiag .

smokeTests:
	venv-py38/bin/python -m unittest test/test_diag.py
