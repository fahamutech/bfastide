export const readComponentBody = fileContent => {
    const matched = `${fileContent}`.match(/((return)\s*\(\s*)(\s.+)*\s*\)/igm);
    const removeReturn = matched && matched.length > 0
        ? `${matched[0]}`.replace(/((return)\s*\(\s*)/igm, '')
        : '';
    return removeReturn.length > 0
        ? removeReturn.trim().substring(0, removeReturn.length - 1).trim()
        : removeReturn.trim();
}

export const readComponentDescription = fileContent => {
    const matched = `${fileContent}`.match(/\/[*]{2,}[\s\w\W]*?\*\//igm);
    return matched && matched.length > 0
        ? `${matched[0]}`.replace(/\/[*]{2,}|^[\s*]+|\//gm, '').trim()
        : '';
}

/**
 *
 * @param acc{Array}
 * @param dependency{string}
 * @returns {Array}
 */
const componentDependencyReducer = (acc, dependency) => {
    const refMatch = `${dependency}`.match(/['"].+['";]/gm);
    const ref = refMatch.length > 0
        ? refMatch[0].replace(/['";]+/gm, '').trim()
        : '';
    const _acc = Array.isArray(acc) ? acc : [];
    return _acc.concat(
        `${dependency}`
            .replace(/^\s*(import)[\s\S]+?|(from)[\s\S]+?['"].+['";]+|[{}\s]+|(as)(?=\s+\S+)|\*/igm, '')
            .split(',')
            .filter(x => x !== '' && !!x)
            .map(element => ({name: element, reference: ref}))
    );
}
export const readComponentDependencies = fileContent => {
    const matched = `${fileContent}`.match(/^\s*(import)[\s\S]+?['"].+['";]/gm);
    return Array.isArray(matched) ? matched.reduce(componentDependencyReducer, []) : [];
}
