
DOT=dot
#FORMAT=png
FORMAT=svg
SRC=demotopo.dot

OUT=$(subst .dot,.$(FORMAT),$(SRC))
DEST=../client/public/

all: $(OUT)

$(OUT): $(SRC)
	$(DOT) -T$(FORMAT) $^ -o $@

install: $(OUT)
	cp -av $(OUT) $(DEST)

clean:
	rm -f $(OUT)
