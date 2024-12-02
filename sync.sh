#!/bin/bash

# Get the remote URL of the 'origin' remote repository
remote_url=$(git remote get-url origin)

# Extract the repository name from the URL
# This works for standard Git and GitHub URLs but might need adjustments for other formats or hosting services
repo_name=$(basename -s .git "$remote_url")

# Navigate to the root directory of your Git repository
cd "$(git rev-parse --show-toplevel)"

# Initialize a flag to track if an error occurs
error_occurred=false

# Check if .gitmodules exists and is not empty
if [ -s .gitmodules ]; then
    # Read each submodule path from .gitmodules
    while IFS= read -r line; do
        # Extract the path of the submodule
        if [[ "$line" =~ ^[[:space:]]*path[[:space:]]*=[[:space:]]*(.*)$ ]]; then
            submodule_path="${BASH_REMATCH[1]}"
            echo "Updating submodule: $submodule_path"
            # Navigate to the submodule directory and pull the latest changes
            git -C "$submodule_path" pull
            if [ $? -ne 0 ]; then
                echo "Error updating submodule at path: $submodule_path"
                error_occurred=true
            fi
        fi
    done < <(grep 'path =' .gitmodules)
else
    echo ".gitmodules file not found or empty."
    error_occurred=true
fi

# Finally, pull the latest changes for the parent repository
echo "Updating parent repository: $repo_name"
git pull
if [ $? -ne 0 ]; then
    echo "Error updating the parent repository"
    error_occurred=true
fi

# Only display "Update complete" if no errors occurred
if [ "$error_occurred" = false ]; then
    echo "Update complete."
else
    echo "Update finished with errors."
fi