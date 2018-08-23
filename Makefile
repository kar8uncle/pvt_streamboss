.PHONY: all test clean
ARTIFACTS=html.html js.js css.css custom_fields.json

SASS=sass
SASS_FLAGS=-r ./sass/functions/url64.rb -r ./sass/functions/png-dimen.rb
SASS_DIR=sass
SCSS=$(wildcard $(SASS_DIR)/*.scss) $(wildcard $(SASS_DIR)/*/*.scss)
MAIN_SCSS=$(SASS_DIR)/main.scss
CSS_ARTIFACT=css.css

DEMO_ASM=./assembleDemo
DEMO_ARTIFACT=output.html

all: $(ARTIFACTS)

test: $(DEMO_ARTIFACT)
	open $^

clean:
	rm -f $(CSS_ARTIFACT) $(DEMO_ARTIFACT)

$(DEMO_ARTIFACT): $(ARTIFACTS)
	$(DEMO_ASM) html.html --css css.css --js js.js --fields custom_fields.json -o $@

$(CSS_ARTIFACT): $(SCSS)
	$(SASS) $(MAIN_SCSS) $@ $(SASS_FLAGS)
