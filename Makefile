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
	
pack:
	cat \
		./scripts/core.array.js \
		./scripts/core.string.js \
		./scripts/core.date.js \
		./scripts/core.number.js \
		./scripts/jquery.ajaxcalendar.js \
		./scripts/jquery.appendscriptstyle.js \
		./scripts/jquery.extra.js \
		./scripts/jquery.events.js \
		./scripts/jquery.passwordstrength.js \
		./scripts/jquery.balclass.js \
		./scripts/jquery.balclass.datetimepicker.js \
		./scripts/jquery.balclass.sparkle.js \
		./scripts/jquery.balclass.bespin.js \
		./scripts/jquery.balclass.timepicker.js \
		./scripts/jquery.balclass.tinymce.js \
		./scripts/jquery.balclass.help.js \
		> ./scripts/compiled/all.js;
		
compress:
	$(MAKE) build;
	
	java -jar $(CLOSUREFILE) --js_output_file=./scripts/compiled/all.min.js --js=./scripts/compiled/all.js;
	java -jar $(YUIFILE) ./styles/all.css -o ./styles/compiled/all.min.css;
	
	$(MAKE) clean;

build:
	$(MAKE) clean;
	mkdir $(BUILDDIR) $(CLOSUREDIR) $(YUIDIR);
	cd $(CLOSUREDIR); wget -q $(CLOSUREURL) -O file.zip; tar -xf file.zip;
	cd $(YUIDIR); wget -q $(YUIURL) -O file.zip; tar -xf file.zip;
	
clean:
	rm -Rf ./build;
	