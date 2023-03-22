P := "\\033[32m[+]\\033[0m"

help:
	@echo "$(P) make dev - Start webpack dev server and watch any changes"
	@echo "$(P) make build - Transpile jsx, es6 and above to es5 files, and build webpack bundles"

dev: 
	@echo "$(P) Start webpack dev server"
	NODE_ENV=development yarn webpack serve -c dev/webpack.config.js

build-lib:
	@echo "$(P) Transpile es6, jsx and (typescript) to es5"
	NODE_ENV=production yarn babel src --out-dir lib-temp --extensions '.ts,.tsx,.js,.jsx' --copy-files --root-mode upward  --ignore 'src/custom-fields/**/views/*'
	NODE_ENV=production yarn babel lib-temp --out-dir lib --extensions '.ts,.tsx' --copy-files --config-file ./.views.babelrc.js
	rm -rf lib-temp/


build: clean build-lib

clean:
	@echo "$(P) Clean lib/"
	rm -rf lib/

.PHONY: build clean dev build-lib
