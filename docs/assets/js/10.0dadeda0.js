(window.webpackJsonp=window.webpackJsonp||[]).push([[10],{311:function(n,e,s){n.exports=s.p+"assets/img/61d072e6.61d072e6.png"},312:function(n,e,s){n.exports=s.p+"assets/img/5959a679.5959a679.png"},335:function(n,e,s){"use strict";s.r(e);var a=s(23),r=Object(a.a)({},(function(){var n=this,e=n.$createElement,a=n._self._c||e;return a("ContentSlotsDistributor",{attrs:{"slot-key":n.$parent.slotKey}},[a("h1",{attrs:{id:"使用-reduce-一行代码解决信用卡号验证问题"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#使用-reduce-一行代码解决信用卡号验证问题"}},[n._v("#")]),n._v(" 使用 reduce 一行代码解决信用卡号验证问题")]),n._v(" "),a("h2",{attrs:{id:"背景"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#背景"}},[n._v("#")]),n._v(" 背景")]),n._v(" "),a("p",[n._v("女票 JAVA 课程有一道作业题，验证信用卡号是否合法。")]),n._v(" "),a("blockquote",[a("p",[n._v("实验作业longer 9月30号 星期五 12:09\n实验1:验证信用卡号码\nLab Project: Validating Credit Cards\n Problem Description:\nCredit card numbers follow certain patterns. A credit card number must have between 13 and 16 digits. It must start with:\n4 for Visa cards\n5 for Master cards\n37 for American Express cards\n6 for Discover cards\nIn 1954, Hans Luhn of IBM proposed an algorithm for validating credit card numbers. The algorithm is useful to determine if a card number is entered correctly or if a credit card is scanned correctly by a scanner. Almost all credit card numbers are generated following this validity check, commonly known as the Luhn check or the Mod 10 check, which can be described as follows (for illustration, consider the card number 4388576018402626):\n1. Double every second digit from right to left. If doubling of a digit results in a two-digit number, add up the two digits to get a single-digit number.\n2 * 2 = 4\n2 * 2 = 4\n4 * 2 = 8\n1 * 2 = 2\n6 * 2 = 12 (1 + 2 = 3)\n5 * 2 = 10 (1 + 0 = 1)\n8 * 2 = 16 (1 + 6 = 7)\n4 * 2 = 8\n2. Now add all single-digit numbers from Step 1. \n4 + 4 + 8 + 2 + 3 + 1 + 7 + 8 = 37\n3. Add all digits in the odd places from right to left in the card number.\n   6 + 6 + 0 + 8 + 0 + 7 + 8 + 3 = 38\n4. Sum the results from Step 2 and Step 3.\n37 + 38 = 75\n5. If the result from Step 4 is divisible by 10, the card number is valid; otherwise, it is invalid. For example, the number 4388576018402626 is invalid, but the number 4388576018410707 is valid.\nWrite a program that prompts the user to enter a credit card number as a long integer. Display whether the number is valid or invalid.")])]),n._v(" "),a("p",[n._v("两个测试用例")]),n._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[n._v("不合法卡号:\n4388576018402626\n合法卡号:\n4388576018410707\n")])]),n._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[n._v("1")]),a("br"),a("span",{staticClass:"line-number"},[n._v("2")]),a("br"),a("span",{staticClass:"line-number"},[n._v("3")]),a("br"),a("span",{staticClass:"line-number"},[n._v("4")]),a("br")])]),a("h2",{attrs:{id:"java-实现"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#java-实现"}},[n._v("#")]),n._v(" JAVA 实现")]),n._v(" "),a("p",[n._v("既然是作业，先用 JAVA 写了。我 JAVA 也不是太熟，就这样。")]),n._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[n._v('import java.util.*;\n\npublic class Validating {\n    public static void main(String[] args) {\n        while (!xiaomiaomiao()) {\n            System.out.println("The number you input is invalid. Please try again.");\n        }\n\n        System.out.println("The number you input is valid.");\n    }\n\n    public static boolean xiaomiaomiao() {\n        System.out.println("Input your card number:");\n        String numStr = (new Scanner(System.in)).next();\n\n        int count = 0;\n        int sum = 0;\n        for (int i = numStr.length() - 1; i >= 0; --i) {\n            // 判断字符合法\n            int ascii = (int) numStr.charAt(i);\n            if (ascii < 48 || 57 < ascii) {\n                System.out.println("Input must be numeric.");\n                return false;\n            }\n\n            // 求和\n            int num = ascii - 48;\n            if ((numStr.length() - i) % 2 == 0) {\n                int tmp = num * 2;\n                sum += tmp > 9 ? tmp - 9 : tmp;\n            } else {\n                sum += num;\n            }\n\n            ++count;\n        }\n\n        if (count < 13 || 16 < count) {\n            System.out.println("13 ~ 16.");\n\n            return false;\n        }\n\n        return (sum % 10 == 0);\n    }\n}\n')])]),n._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[n._v("1")]),a("br"),a("span",{staticClass:"line-number"},[n._v("2")]),a("br"),a("span",{staticClass:"line-number"},[n._v("3")]),a("br"),a("span",{staticClass:"line-number"},[n._v("4")]),a("br"),a("span",{staticClass:"line-number"},[n._v("5")]),a("br"),a("span",{staticClass:"line-number"},[n._v("6")]),a("br"),a("span",{staticClass:"line-number"},[n._v("7")]),a("br"),a("span",{staticClass:"line-number"},[n._v("8")]),a("br"),a("span",{staticClass:"line-number"},[n._v("9")]),a("br"),a("span",{staticClass:"line-number"},[n._v("10")]),a("br"),a("span",{staticClass:"line-number"},[n._v("11")]),a("br"),a("span",{staticClass:"line-number"},[n._v("12")]),a("br"),a("span",{staticClass:"line-number"},[n._v("13")]),a("br"),a("span",{staticClass:"line-number"},[n._v("14")]),a("br"),a("span",{staticClass:"line-number"},[n._v("15")]),a("br"),a("span",{staticClass:"line-number"},[n._v("16")]),a("br"),a("span",{staticClass:"line-number"},[n._v("17")]),a("br"),a("span",{staticClass:"line-number"},[n._v("18")]),a("br"),a("span",{staticClass:"line-number"},[n._v("19")]),a("br"),a("span",{staticClass:"line-number"},[n._v("20")]),a("br"),a("span",{staticClass:"line-number"},[n._v("21")]),a("br"),a("span",{staticClass:"line-number"},[n._v("22")]),a("br"),a("span",{staticClass:"line-number"},[n._v("23")]),a("br"),a("span",{staticClass:"line-number"},[n._v("24")]),a("br"),a("span",{staticClass:"line-number"},[n._v("25")]),a("br"),a("span",{staticClass:"line-number"},[n._v("26")]),a("br"),a("span",{staticClass:"line-number"},[n._v("27")]),a("br"),a("span",{staticClass:"line-number"},[n._v("28")]),a("br"),a("span",{staticClass:"line-number"},[n._v("29")]),a("br"),a("span",{staticClass:"line-number"},[n._v("30")]),a("br"),a("span",{staticClass:"line-number"},[n._v("31")]),a("br"),a("span",{staticClass:"line-number"},[n._v("32")]),a("br"),a("span",{staticClass:"line-number"},[n._v("33")]),a("br"),a("span",{staticClass:"line-number"},[n._v("34")]),a("br"),a("span",{staticClass:"line-number"},[n._v("35")]),a("br"),a("span",{staticClass:"line-number"},[n._v("36")]),a("br"),a("span",{staticClass:"line-number"},[n._v("37")]),a("br"),a("span",{staticClass:"line-number"},[n._v("38")]),a("br"),a("span",{staticClass:"line-number"},[n._v("39")]),a("br"),a("span",{staticClass:"line-number"},[n._v("40")]),a("br"),a("span",{staticClass:"line-number"},[n._v("41")]),a("br"),a("span",{staticClass:"line-number"},[n._v("42")]),a("br"),a("span",{staticClass:"line-number"},[n._v("43")]),a("br"),a("span",{staticClass:"line-number"},[n._v("44")]),a("br"),a("span",{staticClass:"line-number"},[n._v("45")]),a("br"),a("span",{staticClass:"line-number"},[n._v("46")]),a("br")])]),a("h2",{attrs:{id:"使用-javascript-的-reduce-实现"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#使用-javascript-的-reduce-实现"}},[n._v("#")]),n._v(" 使用 Javascript 的 reduce 实现")]),n._v(" "),a("p",[n._v("先上一张图\n"),a("img",{attrs:{src:s(311),alt:""}}),n._v("\n很形象的描述了 Reduce 的作用是吧。\n然后代码实现，一句话解决（未校验号码长度）")]),n._v(" "),a("div",{staticClass:"language- line-numbers-mode"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[n._v("[...'4388576018410707'].reduceRight((previousValue, currentValue, index, array) => {if ((array.length-index) % 2) {return previousValue - -currentValue} else {return previousValue - -(currentValue*2 > 9 ? currentValue*2-9 : currentValue*2)} }) % 10 ? '验证失败' : '验证成功'\n\"验证成功\"\n[...'4388576018402626'].reduceRight((previousValue, currentValue, index, array) => {if ((array.length-index) % 2) {return previousValue - -currentValue} else {return previousValue - -(currentValue*2 > 9 ? currentValue*2-9 : currentValue*2)} }) % 10 ? '验证失败' : '验证成功'\n\"验证失败\"\n")])]),n._v(" "),a("div",{staticClass:"line-numbers-wrapper"},[a("span",{staticClass:"line-number"},[n._v("1")]),a("br"),a("span",{staticClass:"line-number"},[n._v("2")]),a("br"),a("span",{staticClass:"line-number"},[n._v("3")]),a("br"),a("span",{staticClass:"line-number"},[n._v("4")]),a("br")])]),a("p",[a("img",{attrs:{src:s(312),alt:""}})]),n._v(" "),a("h2",{attrs:{id:"参考"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#参考"}},[n._v("#")]),n._v(" 参考")]),n._v(" "),a("ol",[a("li",[a("a",{attrs:{href:"http://es6.ruanyifeng.com/?search=reduce&x=0&y=0#docs/destructuring",target:"_blank",rel:"noopener noreferrer"}},[n._v("http://es6.ruanyifeng.com/?search=reduce&x=0&y=0#docs/destructuring"),a("OutboundLink")],1)]),n._v(" "),a("li",[a("a",{attrs:{href:"https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight",target:"_blank",rel:"noopener noreferrer"}},[n._v("https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight"),a("OutboundLink")],1)])])])}),[],!1,null,null,null);e.default=r.exports}}]);