import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "node_modules/**", "public/**"],
  },
  {
    rules: {
      // This app deliberately reads window/localStorage/URL params inside
      // useEffect (not during render) to avoid server/client hydration
      // mismatches, since none of those exist during SSR. That is the
      // correct fix for the scenario this rule targets, not a violation of
      // it — downgraded to a warning so real cascading-render bugs
      // elsewhere still surface without flagging every mount-time read.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
];

export default eslintConfig;
