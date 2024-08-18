# Loop to create changes and commit them 20 times
for i in {1..20}
do
  # Create or modify a file
  echo "Change $i" >> file.txt

  # Add the changes to the staging area
  git add file.txt

  # Commit the changes with a sequential message
  git commit -m "$1 - Commit $i"

  # Optional: Sleep for a short period to simulate different commit times
  # sleep 1
done

# Push all the commits to the remote repository
git push

# Output the status of the repository after the push
git status
