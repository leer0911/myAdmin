## Generator 扫盲

在过去，封装一段逻辑运算的单元是函数。函数只存在"没有被调用"或者"被调用"的情况，不存在一个函数被执行之后还能暂停的情况，而 Generator 的出现让这种情况成为可能。

## 定义

与普通函数相比，它只多出了一个\*号。

```js
var compute = function*(a, b) {
  var sum = a + b;
};
```

定义的 Generator 实际上可以理解为定义了一种特殊的数据结构，要得到 Generator 实例，还要执行它一次

```js
var generator = compute(4, 2);
```

这样我们能得到一个 Generator 对象。Generator 对象具有一个 next 方法。要使得定义中封装的代码逻辑得到执行，还需要调用一次 next 方法才行。

```js
generator.next();
```

## yield 关键字

yield 关键字让 Generator 内部的逻辑能够切割成多个部分。

```js
var compute = function*(a, b) {
  var sum = a + b;
  yield console.log(sum);
};
```

代码执行到第一个 yield 关键字的时候会停止，要让逻辑继续执行完，需要反复调用 next()

可以简单地理解为 yield 关键字将程序逻辑划分成几部分，每次 next()执行时执行一部分。

这使得程序的执行单元再也不是函数，复杂的逻辑可以通过 yield 来暂停。

yield 除了切割逻辑外，它与 next 的行为息息相关，每次 next 调用时，返回一个对象。这个对象具备两个属性。其中一个属性是布尔型的 done

它表示这个 Generator 对象的逻辑块是否执行完成。另一个属性是 value，它来自于 yield 语句后的表达式的结果。

## Generator 与异步编程

顺序读取两个文件的场景：

```js
fs.readFile('file1.txt', 'utf8', function(err, txt) {
  if (err) {
    throw err;
  }
  fs.readFile(txt, 'utf8', function(err, content) {
    if (err) {
      throw err;
    }
    console.log(content);
  });
});
```

如果我们要完成这两个操作，而且不以嵌套的方式进行，我们可以很自然想到以 yield 来分割两个操作。

```js
var flow = function*() {
  var txt = yield fs.readFile('file1.txt', 'utf8');
  var content = yield fs.readFile(txt, 'utf8');
  console.log(content);
};
```

### 改造异步方法

为了完成收集异步调用的结果数据，我们必须得借助高阶函数。

```js
var helper = function(fn) {
  return function() {
    var args = [].slice.call(arguments);
    var pass;
    args.push(function() {
      if (pass) {
        pass.apply(null, arguments);
      }
    });

    fn.apply(null, args);
    return function(fn) {
      pass = fn;
    };
  };
};
```
