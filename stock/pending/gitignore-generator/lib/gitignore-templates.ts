export const GITIGNORE_TEMPLATES: Record<string, string> = {
  "Node.js": `# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.yarn-integrity
dist/
build/
.env
.env.local
.env.*.local
`,

  "Python": `# Python
__pycache__/
*.py[cod]
*$py.class
*.egg
*.egg-info/
dist/
build/
.eggs/
.venv/
venv/
env/
.Python
pip-log.txt
`,

  "Java": `# Java
*.class
*.jar
*.war
*.ear
*.nar
target/
.gradle/
build/
out/
*.iml
.classpath
.project
`,

  "Go": `# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
*.test
*.out
vendor/
go.sum
`,

  "Rust": `# Rust
/target/
Cargo.lock
**/*.rs.bk
*.pdb
`,

  "Ruby": `# Ruby
*.gem
*.rbc
/.config
/coverage/
/InstalledFiles
/pkg/
/spec/reports/
/spec/examples.txt
/test/tmp/
/test/version_tmp/
.bundle/
Gemfile.lock
vendor/bundle/
`,

  "Swift": `# Swift
.build/
.swiftpm/
*.o
*.d
DerivedData/
*.moved-aside
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
xcuserdata/
`,

  "Kotlin": `# Kotlin
*.class
*.jar
.gradle/
build/
out/
.kotlin/
*.iml
.idea/
local.properties
`,

  "C++": `# C++
*.o
*.obj
*.exe
*.out
*.app
*.dll
*.so
*.dylib
*.a
*.lib
build/
cmake-build-*/
CMakeFiles/
CMakeCache.txt
`,

  "C#": `# C#
bin/
obj/
*.user
*.suo
*.userprefs
.vs/
packages/
*.nupkg
*.snupkg
`,

  "Unity": `# Unity
[Ll]ibrary/
[Tt]emp/
[Oo]bj/
[Bb]uild/
[Bb]uilds/
[Ll]ogs/
[Uu]ser[Ss]ettings/
*.pidb
*.unityproj
*.sln
*.csproj
*.booproj
`,

  "Unreal Engine": `# Unreal Engine
Binaries/
Build/
DerivedDataCache/
Intermediate/
Saved/
*.VC.db
*.opensdf
*.opendb
*.sdf
*.sln
*.suo
*.xcworkspace
`,

  "macOS": `# macOS
.DS_Store
.AppleDouble
.LSOverride
._*
.Spotlight-V100
.Trashes
.fseventsd
.TemporaryItems
.DocumentRevisions-V100
`,

  "Windows": `# Windows
Thumbs.db
Thumbs.db:encryptable
ehthumbs.db
ehthumbs_vista.db
Desktop.ini
$RECYCLE.BIN/
*.lnk
*.cab
*.msi
`,

  "Linux": `# Linux
*~
.fuse_hidden*
.directory
.Trash-*
.nfs*
`,

  "JetBrains": `# JetBrains IDEs
.idea/
*.iml
*.iws
*.ipr
out/
.idea_modules/
atlassian-ide-plugin.xml
`,

  "VSCode": `# Visual Studio Code
.vscode/
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json
*.code-workspace
.history/
`,

  "Vim": `# Vim
[._]*.s[a-v][a-z]
!*.svg
[._]*.sw[a-p]
[._]s[a-rt-v][a-z]
[._]ss[a-gi-z]
[._]sw[a-p]
Session.vim
Sessionx.vim
.netrwhist
*~
tags
[._]*.un~
`,

  "Emacs": `# Emacs
*~
\#*\#
/.emacs.desktop
/.emacs.desktop.lock
*.elc
auto-save-list
tramp
.\#*
.org-id-locations
*_archive
*.gpg
`,

  "Xcode": `# Xcode
*.xcworkspace
xcuserdata/
DerivedData/
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
.build/
`,

  "Android": `# Android
*.iml
.gradle/
local.properties
.idea/
.DS_Store
build/
captures/
.externalNativeBuild/
.cxx/
*.apk
`,

  "React": `# React
node_modules/
build/
dist/
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
yarn-debug.log*
`,

  "Vue": `# Vue
node_modules/
dist/
.env
.env.local
.env.*.local
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
`,

  "Angular": `# Angular
node_modules/
dist/
tmp/
out-tsc/
bazel-out/
.angular/cache/
.sass-cache/
connect.lock/
coverage/
`,

  "Next.js": `# Next.js
node_modules/
.next/
out/
build/
.env*.local
npm-debug.log*
yarn-debug.log*
*.pem
`,

  "Nuxt.js": `# Nuxt.js
node_modules/
.nuxt/
dist/
.output/
.env
npm-debug.log*
yarn-debug.log*
`,

  "Django": `# Django
*.log
*.pot
*.pyc
__pycache__/
local_settings.py
db.sqlite3
db.sqlite3-journal
media/
staticfiles/
.venv/
`,

  "Flask": `# Flask
instance/
.webassets-cache
.env
*.pyc
__pycache__/
venv/
.venv/
*.egg-info/
`,

  "Laravel": `# Laravel
vendor/
node_modules/
.env
.env.backup
.phpunit.result.cache
storage/*.key
public/hot
public/storage
`,

  "Rails": `# Rails
*.rbc
capybara-*.html
.rspec
/db/*.sqlite3
/db/*.sqlite3-journal
/db/*.sqlite3-shm
/db/*.sqlite3-wal
/log/*
/tmp/*
/storage/*
`,

  "Spring Boot": `# Spring Boot
target/
.gradle/
build/
!**/src/main/**/build/
!**/src/test/**/build/
*.jar
*.war
*.class
application-local.properties
`,

  "Express": `# Express / Node
node_modules/
npm-debug.log*
yarn-debug.log*
.env
.env.local
dist/
build/
logs/
*.log
`,

  "FastAPI": `# FastAPI / Python
__pycache__/
*.py[cod]
.venv/
venv/
.env
*.db
*.sqlite
dist/
build/
`,

  "Terraform": `# Terraform
.terraform/
*.tfstate
*.tfstate.*
crash.log
crash.*.log
override.tf
override.tf.json
*_override.tf
*_override.tf.json
.terraformrc
`,

  "Docker": `# Docker
.docker/
docker-compose.override.yml
*.log
.env
.env.local
`,

  "Kubernetes": `# Kubernetes
*.kubeconfig
kubeconfig
.kube/
secrets.yaml
*-secret.yaml
`,

  "Ansible": `# Ansible
*.retry
.vault_pass
inventory/host_vars/*
inventory/group_vars/*
!inventory/host_vars/.gitkeep
!inventory/group_vars/.gitkeep
`,

  "Svelte": `# Svelte / SvelteKit
node_modules/
.svelte-kit/
build/
dist/
.env
.env.*
!.env.example
`,

  "Astro": `# Astro
node_modules/
dist/
.astro/
.env
.env.production
npm-debug.log*
yarn-debug.log*
`,

  "Electron": `# Electron
node_modules/
dist/
build/
out/
.env
npm-debug.log*
release/
`,

  "Flutter": `# Flutter / Dart
.dart_tool/
.flutter-plugins
.flutter-plugins-dependencies
.packages
build/
*.g.dart
pubspec.lock
`,

  "Deno": `# Deno
.deno/
dist/
.env
*.js.map
lock.json
`,

  "Bun": `# Bun
node_modules/
dist/
build/
bun.lockb
.env
.env.local
`,

  "Elixir": `# Elixir / Phoenix
_build/
cover/
deps/
doc/
.fetch
erl_crash.dump
*.ez
*.beam
/config/*.secret.exs
.elixir_ls/
`,

  "Haskell": `# Haskell
dist/
dist-newstyle/
.stack-work/
*.hi
*.o
*.dyn_hi
*.dyn_o
cabal.project.local
`,

  "Scala": `# Scala / SBT
target/
project/target/
project/project/
.bsp/
.metals/
.bloop/
*.class
`,

  "PHP": `# PHP
vendor/
composer.lock
.phpunit.cache/
*.log
.env
.env.local
cache/
`,

  "Perl": `# Perl
blib/
*.bs
*.o
*.a
pm_to_blib
!Build
!Makefile
*.tmp
*.bak
MANIFEST.bak
`,

  "R": `# R
.Rhistory
.Rapp.history
.RData
.Ruserdata
*.Rproj.user/
rsconnect/
.Renviron
`,

  "Julia": `# Julia
*.jl.cov
*.jl.mem
Manifest.toml
.julia_history
`,

  "MATLAB": `# MATLAB
*.asv
*.autosave
*.m~
codegenreport.html
codegen/
slprj/
`,

  "Jupyter": `# Jupyter Notebooks
.ipynb_checkpoints/
*/.ipynb_checkpoints/*
profile_default/
ipython_config.py
__pycache__/
`,

  "Hugo": `# Hugo
public/
resources/_gen/
assets/jsconfig.json
.hugo_build.lock
node_modules/
`,

  "Gatsby": `# Gatsby
.cache/
public/
node_modules/
.env
.env.development
.env.production
`,

  "Remix": `# Remix
node_modules/
.cache/
build/
public/build/
.env
`,

  "Tauri": `# Tauri
node_modules/
src-tauri/target/
dist/
build/
.env
`,

  "Zig": `# Zig
zig-out/
zig-cache/
*.o
*.a
`,

  "Crystal": `# Crystal
lib/
.shards/
*.dwarf
`,

  "Nim": `# Nim
nimcache/
*.exe
*.out
*.a
nimble.lock
`,
};

export const TEMPLATE_CATEGORIES: Record<string, string[]> = {
  "Languages": [
    "Node.js", "Python", "Java", "Go", "Rust", "Ruby", "Swift", "Kotlin",
    "C++", "C#", "PHP", "Perl", "R", "Julia", "MATLAB", "Haskell", "Scala",
    "Elixir", "Zig", "Crystal", "Nim",
  ],
  "Frameworks": [
    "React", "Vue", "Angular", "Next.js", "Nuxt.js", "Svelte", "Astro",
    "Gatsby", "Remix", "Django", "Flask", "FastAPI", "Laravel", "Rails",
    "Spring Boot", "Express", "Flutter", "Electron", "Tauri", "Deno", "Bun",
  ],
  "Game Engines": ["Unity", "Unreal Engine"],
  "IDEs & Editors": ["JetBrains", "VSCode", "Vim", "Emacs", "Xcode"],
  "Mobile": ["Android"],
  "DevOps & Cloud": ["Terraform", "Docker", "Kubernetes", "Ansible"],
  "Data Science": ["Jupyter"],
  "Static Sites": ["Hugo"],
  "OS": ["macOS", "Windows", "Linux"],
};
