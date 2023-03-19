PROJDIR := $(realpath $(CURDIR)/..)
SOURCEDIR := $(PROJDIR)/dictionnary/src
BUILDDIR := ../bin/
CC = gcc


dictionnary_build: $(SOURCEDIR)/dictionnary_build.c $(SOURCEDIR)/trees.c $(SOURCEDIR)/libs.c
	$(CC) -o $(BUILDDIR)/dictionnary_build $(SOURCEDIR)/dictionnary_build.c $(SOURCEDIR)/trees.c $(SOURCEDIR)/libs.c

dictionnary_lookup: $(SOURCEDIR)/dictionnary_lookup.c $(SOURCEDIR)/trees.c $(SOURCEDIR)/libs.c
	$(CC) -o $(BUILDDIR)/dictionnary_lookup $(SOURCEDIR)/dictionnary_lookup.c $(SOURCEDIR)/trees.c $(SOURCEDIR)/libs.c

grid_build: $(SOURCEDIR)/grid_build.c $(SOURCEDIR)/libs.c
	$(CC) -o $(BUILDDIR)/grid_build $(SOURCEDIR)/grid_build.c $(SOURCEDIR)/libs.c


grid_path: $(SOURCEDIR)/grid_path.c $(SOURCEDIR)/libs.c
	$(CC) -o $(BUILDDIR)/grid_path $(SOURCEDIR)/grid_path.c $(SOURCEDIR)/libs.c

score_basic: $(SOURCEDIR)/score_basic.c
	$(CC) -o $(BUILDDIR)/score_basic $(SOURCEDIR)/score_basic.c

score_len: $(SOURCEDIR)/score_len.c
	$(CC) -o $(BUILDDIR)/score_len $(SOURCEDIR)/score_len.c


solve : $(SOURCEDIR)/solve.c $(SOURCEDIR)/libs.c $(SOURCEDIR)/trees.c $(SOURCEDIR)/grid_path.c
	$(CC) -o $(BUILDDIR)/solve $(SOURCEDIR)/solve.c $(SOURCEDIR)/libs.c $(SOURCEDIR)/trees.c $(SOURCEDIR)/grid_path.c -DEXTERNAL_DRIVER

clean:
	rm -f $(SOURCEDIR)/*.o


all: dictionnary_build dictionnary_lookup grid_build grid_path score_basic score_len clean
