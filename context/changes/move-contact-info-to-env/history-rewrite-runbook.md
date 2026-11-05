# History rewrite runbook

Removes the email and phone from every commit on `main`. You run this by hand. It rewrites all SHAs and force-pushes, so read it through once before starting.

This file never contains the real values. Wherever you see `<email>` or `<phone>`, use the real string.

## What the history looks like today

Checked on 2026-11-05 against the local clone:

- One branch (`main`), no tags, no commit message mentions the values.
- 4 commits introduced or removed an occurrence of the email, and 4 did the same for the phone. They live in `lib/profile.json` and the archived plan.
- `public/Maciek-Dzialo-CV-English.pdf` has exactly one version in history, and it is the current one. It contains both values in plain text.

## Before you start

1. Phases 1 to 3 are on `origin/main` and the deploy is green. The force push in step 6 starts another deploy, which needs the GitHub and Worker secrets already in place.
2. `git-filter-repo` needs Python 3, and this machine has none installed. Install it first:
   `winget install Python.Python.3.12`, then `pip install git-filter-repo`.
3. If `main` has branch protection, turn off "block force pushes" for the length of step 6.
4. Copy `.env.local` somewhere safe. Step 7 replaces the working copy.

## Steps

### 1. Fresh clone and backup

filter-repo refuses to run in a clone that has local work, so use a throwaway clone and keep a mirror as a backup.

```bash
git clone --mirror https://github.com/mdzialo00/c5.engineer.git c5.engineer-backup.git
git clone https://github.com/mdzialo00/c5.engineer.git c5.engineer-rewrite
```

### 2. Save the current PDF

The PDF has one version, so keep a copy. The rewrite removes it from history, and step 4 puts it back.

```bash
cp c5.engineer-rewrite/public/Maciek-Dzialo-CV-English.pdf ./cv-keep.pdf
```

### 3. Write the replacement list

Create `replacements.txt` next to the clone, not inside it, and never commit it. One rule per line:

```
<email>==>redacted@example.com
<phone as written on the site>==>+00 000-000-000
<phone with spaces and dashes removed>==>0000000000
```

Add a line for any other spelling you have used, for example the phone without the country code.

### 4. Rewrite

The PDF is removed first because `--replace-text` would change bytes inside it and break the file.

```bash
cd c5.engineer-rewrite
git filter-repo \
  --path public/Maciek-Dzialo-CV-English.pdf --invert-paths \
  --replace-text ../replacements.txt
cp ../cv-keep.pdf public/Maciek-Dzialo-CV-English.pdf
git add public/Maciek-Dzialo-CV-English.pdf
git commit -m "chore(cv): restore cv pdf"
```

filter-repo drops the `origin` remote on purpose.

### 5. Verify before pushing

```bash
git log --all -S"<email>" --oneline        # expect no output
git log --all -S"<phone as written on the site>" --oneline   # expect no output
git grep -I -i "<email>" $(git rev-list --all)   # expect no output
```

The PDF at `HEAD` still contains both values, because you chose to keep it. It is the only match left.

### 6. Force push

```bash
git remote add origin https://github.com/mdzialo00/c5.engineer.git
git push --force origin main
```

The push starts a deploy. Watch it go green. Then turn branch protection back on.

### 7. Replace your working copy

Your old checkout still holds the old history, and pushing from it would bring the values back.

```bash
cd ..
mv c5.engineer c5.engineer-old
git clone https://github.com/mdzialo00/c5.engineer.git c5.engineer
cp <saved>/.env.local c5.engineer/.env.local
cd c5.engineer && yarn install
```

Delete `c5.engineer-old`, `c5.engineer-backup.git` and `replacements.txt` once everything checks out. The backup and the replacement list both hold the real values.

### 8. Clear GitHub's copies

The rewrite changes your branch. It does not remove the old commits from GitHub.

- Old commit URLs keep working until GitHub garbage-collects them. Open a ticket at https://support.github.com/contact and choose the sensitive data removal option. Ask them to drop cached views and unreachable commits for `mdzialo00/c5.engineer`. Give them a few old commit SHAs from `git log` in the backup.
- Check for forks (repo page, Insights, Forks) and for any pull requests. Their refs keep the old commits and you cannot rewrite them yourself.
- Anyone who cloned the repo before the rewrite still has the old history.

### 9. Check GitHub search

Wait a few hours, then search `https://github.com/search?q=<email>&type=code` while logged in, and again logged out. Repeat for the phone.

## Limits

- The values were public for weeks. Treat them as already scraped. The rewrite stops the repo from being the place people find them. It cannot make them private.
- The live site still shows both values by design.
