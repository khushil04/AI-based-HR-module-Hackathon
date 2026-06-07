const LoadingState = ({ label = "Loading..." }: { label?: string }) => (
  <div className="loading-state">
    <div className="spinner" />
    <p>{label}</p>
  </div>
);

export default LoadingState;
