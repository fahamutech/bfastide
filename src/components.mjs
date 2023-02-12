import {createHash} from 'node:crypto';

export const readComponentBody = fileContent => {
    const matched = `${fileContent}`.match(/((return)\s*\(\s*)(\s.+)*\s*\)/igm);
    const removeReturn = Array.isArray(matched) && matched.length > 0
        ? `${matched[0]}`.replace(/((return)\s*\(\s*)/igm, '')
        : '';
    return removeReturn.length > 0
        ? removeReturn.trim().substring(0, removeReturn.length - 1).trim()
        : removeReturn.trim();
}

export const readComponentDescription = fileContent => {
    const matched = `${fileContent}`.match(/\/[*]{2,}[\s\w\W]*?\*\//igm);
    return Array.isArray(matched) && matched.length > 0
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

export const readComponentProps = fileContent => {
    const matchSignature = `${fileContent}`
        .match(/^\s*(export)\s+(function)\s+[a-zA-Z0-9]+\s*\(\s*\{[\s\S]+?\}\s*\)?/igm);
    return Array.isArray(matchSignature) && matchSignature.length > 0
        ? matchSignature[0]
            .replace(/^[\s\S]*\{|\s*\}\s*\)/igm, '')
            .trim()
            .split(',')
            .filter(x => x !== '' && !!x)
        : [];
}

const stateReducer = (acc, stateContent) => {
    const [value, setValue] = `${stateContent}`
        .replace(/^\s*(const)\s*\[|\][\s\S]+?[);]+/gm, '')
        .trim().split(',');
    const initialValue = `${stateContent}`
        .replace(/^\s*(const)\s*\[[a-zA-Z0-9,_\-\s]+\]\s*=\s*(useState)\s*\(|[);]+/gm, '')
        .replace(/^\s*['"]+|['"]+$/gm, '')
        .trim();
    const _d = {
        state: value,
        setState: setValue,
        initialValue: initialValue === ''
            ? undefined
            : isNaN(Number(initialValue))
                ? initialValue
                : Number(initialValue)
    };
    return Array.isArray(acc) ? acc.concat([_d]) : [_d];
}
export const readComponentStates = fileContent => {
    const matched = `${fileContent}`
        .match(/^\s*(const)\s*\[[a-zA-Z0-9,_\-\s]+\]\s*=\s*(useState)\s*\(\s*[}{0-9a-zA-Z\s:_\-'",]*\)/gm);
    return Array.isArray(matched) ? matched.reduce(stateReducer, []) : [];
}

const extractEffect = block => `${block}`.match(/^\s*(useEffect)\s*\([\s\S]+?(?=(useEffect)\s*\()/gm);
export const readComponentEffects = fileContent => {
    const matched = `${fileContent}`.match(/^\s*(useEffect)\s*\([\s\S]+(?=(return)\s*\()/gm);
    let effectBlock = Array.isArray(matched) && matched.length > 0 ? `${matched[0].trim()} useEffect(()=>{},[])` : '';
    const effects = [];
    while (true) {
        const extracted = extractEffect(effectBlock);
        if (Array.isArray(extracted) && extracted.length > 0) {
            const effect = extracted[0].trim();
            const depMatches = `${effect}`.match(/\[\s*[a-zA-Z0-9_,\s\-]*\s*\](?=\s*\)\s*;*$)/g);
            effects.push({
                hash: createHash('sha1')
                    .update(`${effect}`.replace(/\s+/igm, ''))
                    .digest('hex'),
                body: effect,
                dependencies: Array.isArray(depMatches)
                    ? depMatches[0]
                        .replace(/[\[\]\s+]+/gm, '')
                        .trim().split(',').filter(x => x !== '' && !!x)
                    : []
            });
            effectBlock = effectBlock.replace(effect, '');
        } else {
            break;
        }
    }
    return effects;
}

