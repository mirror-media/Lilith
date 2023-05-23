P := "\\033[32m[+]\\033[0m"

help:
	@echo "$(P) make clean - Clean program generated folders, such as `lib/`"
	@echo "$(P) make build - Transpile jsx, es6 and above to es5 files, and build webpack bundles"

build-lib:
	@echo "$(P) Transpile es6, typescript, jsx and tsx to es5"
	NODE_ENV=production yarn babel src --out-dir lib --extensions '.ts,.tsx,.js,.jsx' --copy-files --root-mode upward

build: clean build-lib

clean:
	@echo "$(P) Clean lib/"
	rm -rf lib/

.PHONY: build clean build-lib
