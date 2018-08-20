.PHONY: all test clean
ARTIFACTS=html.html js.js css.css custom_fields.json

SASS=sass
SASS_FLAGS=-r ./sass/functions/url64.rb
SASS_DIR=sass
SCSS=$(wildcard $(SASS_DIR)/*.scss)
MAIN_SCSS=$(SASS_DIR)/main.scss

DEMO_ASM=./assembleDemo
DEMO=output.html

all: $(ARTIFACTS)

test: $(DEMO)
	open $^

clean:
	rm -f css.css
	git clean -fxd

$(DEMO): $(ARTIFACTS)
	$(DEMO_ASM) html.html --css css.css --js js.js --fields custom_fields.json -o $@

css.css: $(SCSS)
	$(SASS) $(MAIN_SCSS) $@ $(SASS_FLAGS)
