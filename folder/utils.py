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


def recursive_delete(folder, profile):
    for child_folder in folder.children_folder.all():
        recursive_delete(child_folder, profile)
    for child_file in folder.children_file.all():
        child_file.delete()
        profile.storage_used -= child_file.get_size()
    folder.delete()


def create_folder(parent_id, owner, name):
    parent = Folder.objects.get(id=parent_id)
    new_folder = Folder(owner=owner, name=name, parent=parent,
                        privacy=parent.privacy)
    new_folder.save()
    new_folder.shared_among.set(parent.shared_among.all())
    new_folder.present_in_shared_me_of.set(
        parent.present_in_shared_me_of.all())
    new_folder.save()
    return new_folder


def create_local_folder(parent_path, folder_name):
    new_folder_path = parent_path.joinpath(folder_name)
    new_folder_path.mkdir(parents=True, exist_ok=True)
    return new_folder_path


def create_folder_rec(parent_path, folder):
    folder_name = folder.name
    new_folder_path = create_local_folder(parent_path, folder_name)
    for child_folder in folder.children_folder.all():
        create_folder_rec(new_folder_path, child_folder)
    for child_file in folder.children_file.all():
        child_file.download_to(new_folder_path)
    return new_folder_path


def create_folder_rec_partial(parent_path, folder, file_ids, folder_ids):
    folder_name = folder.name
    new_folder_path = create_local_folder(parent_path, folder_name)
    for child_folder in folder.children_folder.all():
        if(child_folder.id in folder_ids):
            create_folder_rec(new_folder_path, child_folder)
    for child_file in folder.children_file.all():
        if(child_file.id in file_ids):
            child_file.download_to(new_folder_path)
    return new_folder_path


def propagate_size_change(folder, amount):
    current = folder
    while(current != None):
        current.size += amount
        current.save()
        current = current.parent
