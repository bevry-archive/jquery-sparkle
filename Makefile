# Javascript/CSS Compressor Makefile - By Benjamin "balupton" Lupton (MIT Licenced)

MAKEFLAGS = --no-print-directory --always-make
MAKE = make $(MAKEFLAGS)

BUILDDIR = ./.build

CLOSUREURL = http://closure-compiler.googlecode.com/files/compiler-latest.zip
CLOSUREDIR = $(BUILDDIR)/closure
CLOSUREFILE = $(CLOSUREDIR)/compiler.jar
YUIURL = http://yui.zenfs.com/releases/yuicompressor/yuicompressor-2.4.7.zip
YUIDIR = $(BUILDDIR)/yui
YUIFILE = $(YUIDIR)/yuicompressor-2.4.7/build/yuicompressor-2.4.7.jar


all:
	$(MAKE) build;
	$(MAKE) add;


demo:
	open ./demo/index.html

add:
	git add .gitignore CHECKLIST.* COPYING.* demo images Makefile README.* scripts styles

push:
	git push --all ; git push --tags ;

edithooks:
	mate .git/hooks/pre-commit


pack:
	cat \
		./scripts/resources/core.array.js \
		./scripts/resources/core.console.js \
		./scripts/resources/core.date.js \
		./scripts/resources/core.number.js \
		./scripts/resources/core.string.js \
		./scripts/resources/jquery.appendscriptstyle.js \
		./scripts/resources/jquery.extra.js \
		./scripts/resources/jquery.events.js \
		./scripts/resources/jquery.utilities.js \
		./scripts/resources/jquery.passwordstrength.js \
		./scripts/resources/jquery.balclass.js \
		./scripts/resources/jquery.balclass.bespin.js \
		./scripts/resources/jquery.balclass.datepicker.js \
		./scripts/resources/jquery.balclass.datetimepicker.js \
		./scripts/resources/jquery.balclass.eventcalendar.js \
		./scripts/resources/jquery.balclass.help.js \
		./scripts/resources/jquery.balclass.timepicker.js \
		./scripts/resources/jquery.balclass.tinymce.js \
		./scripts/resources/jquery.balclass.sparkle.js \
		> ./scripts/jquery.sparkle.js;

compress:
	java -jar $(CLOSUREFILE) --create_source_map ./scripts/closure.map --js_output_file=./scripts/jquery.sparkle.min.js --js=./scripts/jquery.sparkle.js;
	java -jar $(YUIFILE) ./styles/jquery.sparkle.css -o ./styles/jquery.sparkle.min.css

build:
	$(MAKE) pack;
	$(MAKE) compress;

build-update:
	$(MAKE) clean;
	mkdir $(BUILDDIR) $(CLOSUREDIR) $(YUIDIR);
	cd $(CLOSUREDIR); wget $(CLOSUREURL) -O file.zip; tar -xf file.zip;
	cd $(YUIDIR); wget $(YUIURL) -O file.zip; tar -xf file.zip;

clean:
	rm -Rf $(BUILDDIR);
