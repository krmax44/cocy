export default function equalArray<A extends any, B extends any>(
	arr1: A[],
	arr2: B[]
): boolean {
	const sameLength = arr1.length === arr2.length;

	return sameLength && arr1.every((v, i) => v === arr2[i]);
}
