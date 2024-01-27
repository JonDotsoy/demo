PWD := `pwd`
DESTINATION := ${HOME}/.bin/demo

all: bun-install build install

bun-install:
	bun install

build:
	bun run build

uninstall:
	rm ${HOME}/.bin/demo

install:
	ln -s ${PWD}/dist/demo ${DESTINATION}

reinstall: uninstall install