import * as fs from 'fs-extra-promise';
import * as path from 'path';

export const FIXTURE_ROOT: string = path.resolve(__dirname, '..', 'fixtures');

export async function loadFixture(fixture: string): Promise<string | false> {
    let pathToTest: string = fixture;

    if (!path.isAbsolute(fixture)) {
        pathToTest = path.join(FIXTURE_ROOT, pathToTest);
    }

    if (!pathToTest.endsWith('.ts') && !pathToTest.endsWith('.tsx')) {
        pathToTest += '.tsx';
    }

    try {
        const stats = await fs.statAsync(pathToTest);
        if (!stats) {
            console.error(`Failed to find fixture (${fixture}) at ${pathToTest}`);
            return false;
        }
    } catch (e) {
        console.error(`Failed to find fixture (${fixture}) at ${pathToTest}`, e);
        return false;
    }
    
    try {
        const content = await fs.readFileAsync(pathToTest);
        return content.toString();
    } catch (e) {
        console.error(`Failed reading fixture (${fixture}) at ${pathToTest}`, e)
        return false;
    }

}

loadFixture('sfc').then(console.log);