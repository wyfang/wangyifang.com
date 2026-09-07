#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
version="${1:-dev}"

case "$version" in
    ''|*[!A-Za-z0-9._-]*)
        echo "Invalid release version: $version" >&2
        exit 1
        ;;
esac

package_name="wangyifang.com-site-${version}"
dist_dir="$repo_root/dist"
archive_path="$dist_dir/${package_name}.zip"
stage_parent="$(mktemp -d "${TMPDIR:-/tmp}/wangyifang-release.XXXXXX")"
package_root="$stage_parent/$package_name"

cleanup() {
    rm -rf "$stage_parent"
}
trap cleanup EXIT

mkdir -p "$package_root" "$dist_dir"

copy_path() {
    local relative_path="$1"
    local source_path="$repo_root/$relative_path"
    local destination_path="$package_root/$relative_path"

    if [[ ! -e "$source_path" ]]; then
        echo "Required release file is missing: $relative_path" >&2
        exit 1
    fi

    mkdir -p "$(dirname "$destination_path")"
    if [[ -d "$source_path" ]]; then
        rm -rf "$destination_path"
        cp -R "$source_path" "$destination_path"
    else
        cp "$source_path" "$destination_path"
    fi
}

# Files that are required but are not discoverable from HTML src/href values.
for relative_path in \
    index.html \
    404.html \
    og-image.png \
    favicon \
    fonts \
    img/wifi-cursor-default.svg \
    img/wifi-cursor-pointer.svg \
    img/wifi-cursor-text.svg \
    img/lottie/glint.json \
    scripts/avatar.js \
    scripts/bodymovin.js \
    LICENSE \
    LICENSE_SCOPE.md \
    NOTICE \
    THIRD_PARTY_NOTICES.md \
    ASSET_SOURCES.md \
    licenses
do
    copy_path "$relative_path"
done

extract_html_references() {
    perl -0777 -ne '
        s/<!--.*?-->//gs;
        while (/\b(?:src|href)="([^"]+)"/g) {
            print "$1\n";
        }
    ' "$repo_root/index.html" "$repo_root/404.html"
}

while IFS= read -r reference; do
    reference="${reference%%\?*}"
    reference="${reference%%\#*}"

    case "$reference" in
        ''|'#'*|http://*|https://*|//*|mailto:*|tel:*|javascript:*)
            continue
            ;;
    esac

    relative_path="${reference#/}"
    copy_path "$relative_path"
done < <(extract_html_references | sort -u)

cat > "$package_root/README.md" <<EOF
# wangyifang.com ${version}

This archive contains the deployable static website files for wangyifang.com.
Serve the extracted directory through an HTTP server; opening index.html with
file:// is not supported because the animated avatar uses browser ES modules.

Project source: https://github.com/wyfang/wangyifang.com

License boundaries and third-party notices are documented in LICENSE_SCOPE.md,
THIRD_PARTY_NOTICES.md, ASSET_SOURCES.md, and the licenses directory.
EOF

for excluded_path in \
    .github \
    .gitignore \
    AGENTS.md \
    This-is-my-website \
    comingsoon \
    steamgame \
    share \
    bootstrap \
    jquery \
    scripts/pdfviewer \
    img/avatar \
    img/bg
do
    if [[ -e "$package_root/$excluded_path" ]]; then
        echo "Excluded path leaked into release package: $excluded_path" >&2
        exit 1
    fi
done

while IFS= read -r reference; do
    reference="${reference%%\?*}"
    reference="${reference%%\#*}"

    case "$reference" in
        ''|'#'*|http://*|https://*|//*|mailto:*|tel:*|javascript:*)
            continue
            ;;
    esac

    relative_path="${reference#/}"
    if [[ ! -e "$package_root/$relative_path" ]]; then
        echo "Packaged HTML reference is missing: $relative_path" >&2
        exit 1
    fi
done < <(extract_html_references | sort -u)

rm -f "$archive_path"
(
    cd "$stage_parent"
    zip -qr "$archive_path" "$package_name"
)

echo "$archive_path"
