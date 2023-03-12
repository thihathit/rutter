#!/bin/sh

# Invoke NVM's node
if [ -x "$(command -v nvm)" ]; then
    source ~/.nvm/nvm.sh
    nvm use
fi

# Invoke FNM's node
if [ -x "$(command -v fnm)" ]; then
    eval "$(fnm env --use-on-cd)"
fi