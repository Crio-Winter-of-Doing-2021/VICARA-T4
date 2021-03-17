from .constants import *
import copy


def delete_by_id(id, filesystem, favourites, recent):
    parent = filesystem[id][PARENT]
    filesystem[parent][CHILDREN].pop(id)
    filesystem.pop(id)
    if id in favourites:
        favourites.pop(id)
    if id in recent:
        recent.pop(id)


def recursive_delete(id, filesystem, favourites, recent):
    children = copy.deepcopy(filesystem[id][CHILDREN])
    for child_id in children:
        if(children[child_id][TYPE] == FOLDER):
            recursive_delete(child_id, filesystem, favourites, recent)
        else:
            delete_by_id(child_id, filesystem, favourites, recent)
    delete_by_id(id, filesystem, favourites, recent)
