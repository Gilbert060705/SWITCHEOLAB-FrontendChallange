var sum_to_n_a = function(a){
    var finalAns = 0;
    for(let i=1;i<=a;i++){
        finalAns += i;
    }

    return finalAns;
};

var sum_to_n_b = function(b){
    return (1+b)*b/2;
}

var sum_to_n_c = function(c){
    if(c == 1){
        return 1;
    }

    return c + sum_to_n_c(c-1);
}

let number = 5;
console.log(sum_to_n_a(number));
console.log(sum_to_n_b(number));
console.log(sum_to_n_c(number));