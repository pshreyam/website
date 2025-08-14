## Manage dotfiles

```
function dotfiles() {
    /usr/bin/git --git-dir=$HOME/.dotfiles/ --work-tree=$HOME $@
}
```

## Clone remote repo to specified location

```
function clone() {
    ret=$(pwd)
    cd ~/Downloads/repos/all
    git clone $1
    cd $ret
}
```

## Change directory into the selected repository

```
function cr() {
    reply=$(echo "$(/bin/ls -1 ~/Downloads/repos/active)" | fzf --border=rounded --height=50% --layout=reverse --header="Choose Repository To cd Into" --header-first --prompt="› " --pointer="➜")
    if [[ -z $reply ]];then
        echo "No repo selected!"
    else
        cd ~/Downloads/repos/active/$reply
    fi
}
```

## Add repo to active repos

```
function mar() {
    reply=$(echo "$(/bin/ls -1 ~/Downloads/repos/all)" | fzf --border=rounded --height=50% --layout=reverse --header="Choose Repository To Make Active" --header-first --prompt="› " --pointer="➜")
    if [[ -z $reply ]];then
        echo "No repo selected!"
    else
        ln -s ~/Downloads/repos/all/$reply ~/Downloads/repos/active/$reply
        echo "Successfully added '$reply' to active repos!"
    fi
}
```

## Remove repo from active repos

```
function rfar() {
    reply=$(echo "$(/bin/ls -1 ~/Downloads/repos/active)" | fzf --border=rounded --height=50% --layout=reverse --header="Choose Repository To Remove From Active" --header-first --prompt="› " --pointer="➜")
    if [[ -z $reply ]];then
        echo "No repo selected!"
    else
        rm ~/Downloads/repos/active/$reply
        echo "Successfully removed '$reply' from active repos!"
    fi
}
```

## Get the absolute path of the selected file and copy it to the clipboard
```
function path() {
    if [[ $# == 0 ]];then
        search_path=`pwd`
    else
        search_path=$1
    fi

    [[ ! -d $search_path ]] && echo "Given path not a directory!" && return 0

    reply=$(echo "$(/bin/ls -1 ${search_path})" | fzf --border=rounded --height=50% --layout=reverse --header="Choose File" --header-first --prompt="› " --pointer="➜")

    [[ -z $reply ]] && echo "No file selected!" && return 0

    absolute_path="$search_path/$reply"
    echo $absolute_path

    if [[ -f "/usr/bin/xclip" ]];then
        echo -n $absolute_path | xclip -selection clipboard
        notify-send "Path copied" "Absolute path copied to the clipboard!"
    else
        notify-send "'xclip' not installed" "Install xclip to copy the absolute path to your clipboard!"
    fi
}
```
