#!/bin/sh

if [ -x "$(command -v git)" ]; then
    git config core.hooksPath ./.githooks/
    chmod +x ./.githooks/pre-commit
    chmod +x ./.githooks/commit-msg
fi