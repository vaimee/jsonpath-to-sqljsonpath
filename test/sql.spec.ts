import { SQLJsonPath, KeyNameSelector, DotStarSelector, ArrayStarSelector, ArrayNumberSelector, DescendantSelector } from "../src/sql";

describe("SQL/JSONPath generator", () => {
    it("should produce $", () => {
        const query = new SQLJsonPath().toString()
        expect(query).toBe("strict $")
    });

    it("should produce $.hello", () => {
        const path = new SQLJsonPath()
        path.selectors.push(new KeyNameSelector("hello"));
        const query = path.toString();
        
        expect(query).toBe("strict $.hello")
    });

    it("should produce $.hello.foo", () => {
        const path = new SQLJsonPath()
        path.selectors.push(new KeyNameSelector("hello"));
        path.selectors.push(new KeyNameSelector("foo"));
        const query = path.toString();
        
        expect(query).toBe("strict $.hello.foo")
    });

    it("should produce $.*", () => {
        const path = new SQLJsonPath()
        path.selectors.push(new DotStarSelector());
        const query = path.toString();

        expect(query).toBe("strict $.*")
    });
    
    it("should produce $.**", () => {
        const path = new SQLJsonPath()
        path.selectors.push(new DescendantSelector());
        const query = path.toString();

        expect(query).toBe("strict $.**")
    });
    
    it("should produce $[*]", () => {
        const path = new SQLJsonPath()
        path.selectors.push(new ArrayStarSelector());
        const query = path.toString();

        expect(query).toBe("strict $[*]")
    });
    
    it("should produce $[1]", () => {
        const path = new SQLJsonPath()
        path.selectors.push(new ArrayNumberSelector([{start: 1}]));
        const query = path.toString();

        expect(query).toBe("strict $[1]")
    });

    it("should produce $[1 to 3]", () => {
        const path = new SQLJsonPath()
        path.selectors.push(new ArrayNumberSelector([{start: 1, end: 3}]));
        const query = path.toString();

        expect(query).toBe("strict $[1 to 3]")
    });

    it("should produce $[1 to 3, 2 , 5 to 6]", () => {
        const path = new SQLJsonPath()
        path.selectors.push(new ArrayNumberSelector([{start: 1, end: 3}, {start: 2}, {start: 5, end: 6}]));
        const query = path.toString();

        expect(query).toBe("strict $[1 to 3,2,5 to 6]")
    });

    it("should produce $.hello.foo.*", () => {
        const path = new SQLJsonPath()
        path.selectors.push(new KeyNameSelector("hello"));
        path.selectors.push(new KeyNameSelector("foo"));
        path.selectors.push(new DotStarSelector());
        const query = path.toString();

        expect(query).toBe("strict $.hello.foo.*")
    });
    
    it("should produce $.hello.foo[*]", () => {
        const path = new SQLJsonPath()
        path.selectors.push(new KeyNameSelector("hello"));
        path.selectors.push(new KeyNameSelector("foo"));
        path.selectors.push(new ArrayStarSelector());
        const query = path.toString();

        expect(query).toBe("strict $.hello.foo[*]")
    });
});