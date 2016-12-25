
DOT=dot
#FORMAT=png
FORMAT=svg
SRC=demotopo.dot

OUT=$(subst .dot,.$(FORMAT),$(SRC))

all: $(OUT)

$(OUT): $(SRC)
	$(DOT) -T$(FORMAT) $^ -o $@

clean:
	rm -f $(OUT)
