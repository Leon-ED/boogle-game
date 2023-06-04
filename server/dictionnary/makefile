PROJDIR := $(realpath $(CURDIR)/..)
SOURCEDIR := $(PROJDIR)/dictionnary/src
SOLVE_DIR := $(SOURCEDIR)/solve
BUILDDIR := ../bin/
CC = gcc
FLAGS = -g


dictionnary_build: $(SOURCEDIR)/dictionnary_build.c $(SOURCEDIR)/trees.c $(SOURCEDIR)/libs.c
	$(CC) -o $(BUILDDIR)/dictionnary_build $(SOURCEDIR)/dictionnary_build.c $(SOURCEDIR)/trees.c $(SOURCEDIR)/libs.c $(FLAGS)

dictionnary_lookup: $(SOURCEDIR)/dictionnary_lookup.c $(SOURCEDIR)/trees.c $(SOURCEDIR)/libs.c
	$(CC) -o $(BUILDDIR)/dictionnary_lookup $(SOURCEDIR)/dictionnary_lookup.c $(SOURCEDIR)/trees.c $(SOURCEDIR)/libs.c $(FLAGS)

grid_build: $(SOURCEDIR)/grid_build.c $(SOURCEDIR)/libs.c
	$(CC) -o $(BUILDDIR)/grid_build $(SOURCEDIR)/grid_build.c $(SOURCEDIR)/libs.c $(FLAGS)


grid_path: $(SOURCEDIR)/grid_path.c $(SOURCEDIR)/libs.c
	$(CC) -o $(BUILDDIR)/grid_path $(SOURCEDIR)/grid_path.c $(SOURCEDIR)/libs.c $(FLAGS)

score_basic: $(SOURCEDIR)/score_basic.c
	$(CC) -o $(BUILDDIR)/score_basic $(SOURCEDIR)/score_basic.c $(FLAGS)

score_len: $(SOURCEDIR)/score_len.c
	$(CC) -o $(BUILDDIR)/score_len $(SOURCEDIR)/score_len.c $(FLAGS)


solve : $(SOLVE_DIR)/solve/*.c $(SOLVE_DIR)/dictionnary_lookup/lookup/*.c 
	$(CC)  $(SOLVE_DIR)/solve/*.c $(SOLVE_DIR)/dictionnary_lookup/lookup/*.c -o $(BUILDDIR)/solve




clean:
	rm -f $(SOURCEDIR)/*.o


all: dictionnary_build dictionnary_lookup grid_build grid_path score_basic score_len clean solve
