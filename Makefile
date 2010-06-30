# Javascript/CSS Compressor Makefile - By Benjamin "balupton" Lupton (MIT Licenced)

MAKEFLAGS = --no-print-directory --always-make
MAKE = make $(MAKEFLAGS)

BUILDDIR = ./build

CLOSUREURL = http://closure-compiler.googlecode.com/files/compiler-latest.zip
CLOSUREDIR = $(BUILDDIR)/closure
CLOSUREFILE = $(CLOSUREDIR)/compiler.jar

INJS = ./scripts/jquery.sparkle.js
OUTJS = ./scripts/jquery.sparkle.min.js

all:
	$(MAKE) build;
	$(MAKE) compress;
	$(MAKE) clean;

build:
	$(MAKE) clean;
	mkdir $(BUILDDIR) $(CLOSUREDIR);
	cd $(CLOSUREDIR); wget -q $(CLOSUREURL) -O file.zip; tar -xf file.zip;
	
clean:
	rm -Rf ./build;
	
compress:
	java -jar $(CLOSUREFILE) --js_output_file=$(OUTJS) --js=$(INJS);
	