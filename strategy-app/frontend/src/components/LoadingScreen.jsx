export default function LoadingScreen({ message = "Loading workspace..." }) {
  return (
    <div className="loading-screen">
      <div className="loader" />
      <p>{message}</p>
    </div>
  );
}
