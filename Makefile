SRC=src
GIT=git@github.com:g0v/hacktabl.git
DEPLOY_BRANCH=gh-pages

.PHONY: build push clean deploy

# Build production html using gulp and put the site in /build directory
#
build: clean
	NODE_ENV=production npm run build
	cp favicon* build/
	cp index.html build/
	cp index.html build/404.html
	cp config/CNAME build/CNAME

# Intialize git and push the content to master.
# Note: It is supposed to be executed in build directory
#
push-in-build:
	git init
	git remote add origin $(GIT)
	git checkout --orphan $(DEPLOY_BRANCH)
	git add .
	git commit -m "Compiled from $(MSG)"
	git push --force origin $(DEPLOY_BRANCH)

# Commits all files in build/ directory to repository's master branch
#
push: build

	cp Makefile build/

	MSG="$(shell git log -n 1 --pretty=format:'%h - %s')" $(MAKE) push-in-build -C build


clean:
	npm run clean

deploy: clean build push
