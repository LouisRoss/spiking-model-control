install: ./include/install.txt
.PHONY: install

./include/install.txt:
	./add-dependencies
	./dockb

.PHONY: clean

clean:
	rm -f ./include/install.txt
