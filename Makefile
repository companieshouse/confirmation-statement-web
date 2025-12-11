artifact_name       := confirmation-statement-web
version             := "unversioned"

.PHONY: all
all: build

.PHONY: clean
clean:
	rm -f ./$(artifact_name)-*.zip
	rm -rf ./build-*
	rm -rf ./dist
	rm -f ./build.log

.PHONY: build
build: update_submodules
	npm ci
	npm run build

.PHONY: lint
lint:
	npm run lint

.PHONY: sonar
sonar: test-unit
	npm run sonarqube

.PHONY: test
test: test-unit

.PHONY: test-unit
test-unit:
	npm run coverage

.PHONY: security-check
security-check:
	npm audit

.PHONY: dependency-check
dependency-check:
	npm audit

.PHONY: package
package: build
ifndef version
	$(error No version given. Aborting)
endif
	$(info Packaging version: $(version))
	$(eval tmpdir := $(shell mktemp -d build-XXXXXXXXXX))
	mkdir $(tmpdir)/api-enumerations
	cp ./api-enumerations/*.yml $(tmpdir)/api-enumerations
	cp -r ./dist/* $(tmpdir)
	cp -r ./package.json $(tmpdir)
	cp -r ./package-lock.json $(tmpdir)
	cd $(tmpdir) && npm ci --production
	cd $(tmpdir) && zip -r ../$(artifact_name)-$(version).zip .
	rm -rf $(tmpdir)

.PHONY: dist
dist: lint test-unit clean package

.PHONY: update_submodules
update_submodules:
	test -f ./api-enumerations/constants.yml || git submodule update --init --recursive -- api-enumerations
