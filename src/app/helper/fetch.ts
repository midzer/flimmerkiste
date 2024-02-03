export async function fetchJSON(file: string): Promise<any> {
    const response = await fetch('assets/json/' + file + '.json');
    return await response.json();
}
