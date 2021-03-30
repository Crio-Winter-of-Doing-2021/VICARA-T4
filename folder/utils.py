from .models import Folder


def set_recursive_trash(folder, value):
    for child_folder in folder.children_folder.all():
        set_recursive_trash(child_folder, value)
    for child_file in folder.children_file.all():
        child_file.trash = value
        child_file.save()
    folder.trash = value
    folder.save()


def set_recursive_privacy(folder, value):
    for child_folder in folder.children_folder.all():
        set_recursive_privacy(child_folder, value)
    for child_file in folder.children_file.all():
        child_file.privacy = value
        child_file.save()
    folder.privacy = value
    folder.save()


def set_recursive_shared_among(folder, value):
    for child_folder in folder.children_folder.all():
        set_recursive_shared_among(child_folder, value)
    for child_file in folder.children_file.all():
        child_file.shared_among.set(value)
        child_file.save()
    folder.shared_among.set(value)
    folder.save()


def recursive_delete(folder):
    for child_folder in folder.children_folder.all():
        recursive_delete(child_folder)
    for child_file in folder.children_file.all():
        child_file.delete()
    folder.delete()


def create_folder(parent_id, owner, name):
    parent = Folder.objects.get(id=parent_id)
    new_folder = Folder(owner=owner, name=name, parent=parent)
    new_folder.save()
    return new_folder
