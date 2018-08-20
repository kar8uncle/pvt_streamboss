.PHONY: all test

all: html.html js.js custom_fields.json main.css

test: output.html
	open $^

output.html: all 
	./compile html.html --css main.css --js js.js --fields custom_fields.json -o $@

main.css: sass
	compass compile .
	cp stylesheets/main.css .
