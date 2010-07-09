# Javascript/CSS Compressor Makefile - By Benjamin "balupton" Lupton (MIT Licenced)

MAKEFLAGS = --no-print-directory --always-make
MAKE = make $(MAKEFLAGS)

BUILDDIR = ./build

CLOSUREURL = http://closure-compiler.googlecode.com/files/compiler-latest.zip
CLOSUREDIR = $(BUILDDIR)/closure
CLOSUREFILE = $(CLOSUREDIR)/compiler.jar
YUIURL = http://yuilibrary.com/downloads/yuicompressor/yuicompressor-2.4.2.zip
YUIDIR = $(BUILDDIR)/yui
YUIFILE = $(YUIDIR)/yuicompressor-2.4.2/build/yuicompressor-2.4.2.jar


all:
	$(MAKE) pack;
	$(MAKE) compress;
	$(MAKE) add;

add:
	git add Makefile README.txt CHECKLIST.txt ./scripts ./styles;

edithooks:
	mate .git/hooks/pre-commit

pack:
	cat \
		./scripts/resources/core.array.js \
		./scripts/resources/core.string.js \
		./scripts/resources/core.date.js \
		./scripts/resources/core.number.js \
		./scripts/resources/jquery.ajaxcalendar.js \
		./scripts/resources/jquery.appendscriptstyle.js \
		./scripts/resources/jquery.extra.js \
		./scripts/resources/jquery.events.js \
		./scripts/resources/jquery.passwordstrength.js \
		./scripts/resources/jquery.balclass.js \
		./scripts/resources/jquery.balclass.datetimepicker.js \
		./scripts/resources/jquery.balclass.sparkle.js \
		./scripts/resources/jquery.balclass.bespin.js \
		./scripts/resources/jquery.balclass.timepicker.js \
		./scripts/resources/jquery.balclass.tinymce.js \
		./scripts/resources/jquery.balclass.help.js \
		> ./scripts/jquery.sparkle.js;
		
compress:
	$(MAKE) build;
	
	java -jar $(CLOSUREFILE) --js_output_file=./scripts/jquery.sparkle.min.js --js=./scripts/jquery.sparkle.js;
	java -jar $(YUIFILE) ./styles/jquery.sparkle.css -o ./styles/jquery.sparkle.min.css
	
	$(MAKE) clean;

build:
	$(MAKE) clean;
	mkdir $(BUILDDIR) $(CLOSUREDIR) $(YUIDIR);
	cd $(CLOSUREDIR); wget -q $(CLOSUREURL) -O file.zip; tar -xf file.zip;
	cd $(YUIDIR); wget -q $(YUIURL) -O file.zip; tar -xf file.zip;
	
clean:
	rm -Rf ./build;
	