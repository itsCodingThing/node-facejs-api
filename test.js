// process.stdin.resume();
// process.stdin.setEncoding("utf-8");
// let stdin_input = "";

// process.stdin.on("data", function (input) {
//   stdin_input += input;
// });

// process.stdin.on("end", function () {
//   main(stdin_input);
// });

// function main(input) {
//   let [testCases, ...cases] = input.trim().split("\n");

//   let output = [];
//   let inputArr = cases.filter((el, i) => (i + 1) % 2 === 0)

//   testCases = Number(testCases);

//   while (testCases > 0) {
//     let tempInputArrOrder = inputArr[testCases - 1].sort((a, b) => b - a);

//     //     let largestNum = tempInputArrOrder[0];

// //     let tempOutput;
// //     inputArr.forEach((el, index, origianlArr) => {
// //       tempOutput = [];
// //       let tempLargstNum = largestNum;

// //       while (tempLargstNum > 0) {
// //         let div = tempLargstNum % el;
// //         if (div === 0) {
// //           if (tempLargstNum <= origianlArr[index - 1]) {
// //             tempOutput.push(tempLargstNum);
// //           }
// //         }
// //       }
// //       --tempLargstNum;
// //     });
// //     output.push(tempOutput);
// //     --testCases;
// //   }

// //   let outputStr = "";
// //   output.forEach((arr) => {
// //     let str = arr.join(" ");

// //     outputStr = outputStr + str + "\n";
// //   });

//   process.stdout.write(outputStr);
// }

let input = "2\n3\n2 1 3\n2\n5 1";

let [testCases, ...cases] = input.trim().split("\n");

let output = [];
let inputArr = cases.filter((el, i) => (i + 1) % 2 === 0).map((el) => el.split(" ").map((el) => Number(el)));
testCases = Number(testCases);

while (testCases > 0) {
    let tempInputArrOrder = [...inputArr[testCases - 1]].sort((a, b) => b - a);
    let tempLargestNumber = tempInputArrOrder[0];
    let tempOutputArr = [];

    inputArr.forEach((el) => {
        el.forEach((val, index) => {
            while (tempLargestNumber > 0) {
                if (tempLargestNumber % val === 0 && tempLargestNumber <= el[index - 1]) {
                    tempOutputArr.push(tempLargestNumber);
                }
                --tempLargestNumber;
            }
        });
    });

    output.push(tempOutputArr);
    --testCases;
}

console.log(output);
